import * as admin from 'firebase-admin';
import { AuditActionType } from '@toolguard/shared';

export async function logAuditEvent(
  db: admin.firestore.Firestore,
  projectId: string,
  action: AuditActionType,
  actorId: string,
  actorEmail?: string,
  metadata: Record<string, unknown> = {}
): Promise<string> {
  const auditRef = db.collection('projects').doc(projectId).collection('auditLogs').doc();
  const auditId = auditRef.id;

  await auditRef.set({
    auditId,
    action,
    actorId,
    actorEmail: actorEmail || null,
    projectId,
    timestamp: new Date().toISOString(),
    serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    metadata
  });

  return auditId;
}
