import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import {
  BaselineManager,
  redactSensitiveData,
  normalizeToolDefinition,
  computeFingerprint
} from '@toolguard/core';
import {
  ToolDefinition,
  Baseline,
  AcceptDriftRequestSchema,
  DriftEvent
} from '@toolguard/shared';
import { logAuditEvent } from './audit/logger';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Validates that the caller is authenticated and a member of the project.
 */
async function verifyProjectAccess(uid: string, projectId: string): Promise<boolean> {
  const projectDoc = await db.collection('projects').doc(projectId).get();
  if (!projectDoc.exists) {
    throw new HttpsError('not-found', 'Project not found');
  }

  const projectData = projectDoc.data();
  if (projectData?.ownerId === uid) {
    return true;
  }

  const memberDoc = await db.collection('projects').doc(projectId).collection('members').doc(uid).get();
  if (memberDoc.exists) {
    return true;
  }

  throw new HttpsError('permission-denied', 'You do not have access to this project');
}

/**
 * Callable Function: Create a new trusted baseline in the cloud
 */
export const createBaseline = onCall({ cors: true }, async (request) => {
  const uid = request.auth?.uid;
  const email = request.auth?.token.email;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { projectId, tools } = request.data as { projectId: string; tools: ToolDefinition[] };
  if (!projectId || !Array.isArray(tools)) {
    throw new HttpsError('invalid-argument', 'Missing or invalid projectId or tools array');
  }

  await verifyProjectAccess(uid, projectId);

  // Fetch current project to determine version
  const baselinesSnap = await db
    .collection('projects')
    .doc(projectId)
    .collection('baselines')
    .orderBy('version', 'desc')
    .limit(1)
    .get();

  const currentVersion = baselinesSnap.empty ? 0 : baselinesSnap.docs[0].data().version;
  const newVersion = currentVersion + 1;

  const baseline = BaselineManager.createBaseline(tools, projectId, uid, newVersion);

  // Store in subcollection
  await db
    .collection('projects')
    .doc(projectId)
    .collection('baselines')
    .doc(baseline.baselineId)
    .set({
      ...baseline,
      serverTimestamp: admin.firestore.FieldValue.serverTimestamp()
    });

  // Update active baseline on project document
  await db.collection('projects').doc(projectId).update({
    activeBaselineId: baseline.baselineId,
    updatedAt: new Date().toISOString()
  });

  // Record audit log
  await logAuditEvent(db, projectId, 'BASELINE_CREATED', uid, email, {
    baselineId: baseline.baselineId,
    version: baseline.version,
    toolCount: baseline.toolCount
  });

  return { success: true, baseline };
});

/**
 * Callable Function: Record a security scan result and record any drift events
 */
export const recordScan = onCall({ cors: true }, async (request) => {
  const uid = request.auth?.uid;
  const email = request.auth?.token.email;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { projectId, tools } = request.data as { projectId: string; tools: ToolDefinition[] };
  if (!projectId || !Array.isArray(tools)) {
    throw new HttpsError('invalid-argument', 'Missing or invalid projectId or tools array');
  }

  await verifyProjectAccess(uid, projectId);

  // Retrieve active baseline
  const projectDoc = await db.collection('projects').doc(projectId).get();
  const activeBaselineId = projectDoc.data()?.activeBaselineId;

  if (!activeBaselineId) {
    throw new HttpsError('failed-precondition', 'No active baseline established for project');
  }

  const baselineDoc = await db
    .collection('projects')
    .doc(projectId)
    .collection('baselines')
    .doc(activeBaselineId)
    .get();

  if (!baselineDoc.exists) {
    throw new HttpsError('not-found', 'Active baseline document not found');
  }

  const baseline = baselineDoc.data() as Baseline;
  const scanResult = BaselineManager.compare(tools, baseline);

  // Persist scan record
  const scanRef = db.collection('projects').doc(projectId).collection('scans').doc(scanResult.scanId);
  await scanRef.set({
    ...scanResult,
    serverTimestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  // Check for drift events and record (avoiding duplicate open events for same fingerprint)
  const driftTools = scanResult.tools.filter((t) => t.driftDetected);
  const createdEvents: string[] = [];

  for (const driftTool of driftTools) {
    // Check if an open event already exists for this tool and fingerprint
    const existingEventsSnap = await db
      .collection('projects')
      .doc(projectId)
      .collection('driftEvents')
      .where('toolId', '==', driftTool.toolId)
      .where('status', '==', 'open')
      .limit(1)
      .get();

    if (existingEventsSnap.empty) {
      const eventRef = db.collection('projects').doc(projectId).collection('driftEvents').doc();
      const eventId = eventRef.id;

      const eventData: DriftEvent = {
        eventId,
        projectId,
        toolId: driftTool.toolId,
        toolName: driftTool.name,
        baselineId: activeBaselineId,
        scanId: scanResult.scanId,
        detectedAt: new Date().toISOString(),
        changes: driftTool.changes,
        severity: driftTool.status === 'HIGH RISK' ? 'high' : 'medium',
        status: 'open'
      };

      await eventRef.set({
        ...eventData,
        serverTimestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      createdEvents.push(eventId);

      // Record audit log
      await logAuditEvent(db, projectId, 'DRIFT_DETECTED', uid, email, {
        eventId,
        toolId: driftTool.toolId,
        toolName: driftTool.name,
        severity: eventData.severity,
        changeCount: driftTool.changes.length
      });
    }
  }

  // Audit log for scan
  await logAuditEvent(db, projectId, 'SCAN_COMPLETED', uid, email, {
    scanId: scanResult.scanId,
    totalTools: scanResult.totalTools,
    driftCount: scanResult.driftCount,
    status: scanResult.status
  });

  return { scanResult, createdEvents };
});

/**
 * Callable Function: Explicitly accept a legitimate drift change
 */
export const acceptDrift = onCall({ cors: true }, async (request) => {
  const uid = request.auth?.uid;
  const email = request.auth?.token.email;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const parsed = AcceptDriftRequestSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError('invalid-argument', parsed.error.message);
  }

  const { projectId, eventId, toolId, reason } = parsed.data;
  await verifyProjectAccess(uid, projectId);

  const eventRef = db.collection('projects').doc(projectId).collection('driftEvents').doc(eventId);
  const eventDoc = await eventRef.get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Drift event not found');
  }

  const eventData = eventDoc.data() as DriftEvent;

  // Fetch active baseline
  const projectDoc = await db.collection('projects').doc(projectId).get();
  const activeBaselineId = projectDoc.data()?.activeBaselineId;
  const baselineDoc = await db
    .collection('projects')
    .doc(projectId)
    .collection('baselines')
    .doc(activeBaselineId)
    .get();

  const baseline = baselineDoc.data() as Baseline;

  // Retrieve current tool definition from scans or tool collection
  const toolDoc = await db.collection('projects').doc(projectId).collection('tools').doc(toolId).get();
  let currentTool: ToolDefinition;

  if (toolDoc.exists) {
    currentTool = toolDoc.data() as ToolDefinition;
  } else {
    // If not in tools collection, synthesize from baseline with accepted changes applied
    currentTool = {
      ...(baseline.tools[toolId]?.normalizedDefinition || {}),
      name: eventData.toolName
    };
    for (const ch of eventData.changes) {
      if (ch.type !== 'removed') {
        currentTool[ch.path] = ch.after;
      }
    }
  }

  // Generate new baseline version
  const newBaseline = BaselineManager.acceptToolChange(baseline, currentTool, uid);

  // Store new baseline document
  await db
    .collection('projects')
    .doc(projectId)
    .collection('baselines')
    .doc(newBaseline.baselineId)
    .set({
      ...newBaseline,
      serverTimestamp: admin.firestore.FieldValue.serverTimestamp()
    });

  // Update project active baseline
  await db.collection('projects').doc(projectId).update({
    activeBaselineId: newBaseline.baselineId,
    updatedAt: new Date().toISOString()
  });

  // Mark event as accepted
  await eventRef.update({
    status: 'accepted',
    acceptedBy: uid,
    acceptedAt: new Date().toISOString(),
    resolvedReason: reason || 'Accepted by developer'
  });

  // Log audit trail
  await logAuditEvent(db, projectId, 'CHANGE_ACCEPTED', uid, email, {
    eventId,
    toolId,
    newBaselineId: newBaseline.baselineId,
    version: newBaseline.version,
    reason: reason || 'Accepted by developer'
  });

  return { success: true, newBaselineId: newBaseline.baselineId };
});
