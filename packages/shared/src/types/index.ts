export type RiskSeverity = 'low' | 'medium' | 'high';
export type TrustStatus = 'SAFE' | 'REVIEW' | 'HIGH RISK';

export interface ToolAuthentication {
  required: boolean;
  type?: 'bearer' | 'oauth2' | 'apikey' | 'basic' | 'custom' | string;
  scopes?: string[];
}

export interface ToolExecution {
  enabled: boolean;
  command?: string;
  isolated?: boolean;
  shell?: boolean;
  timeoutMs?: number;
}

export interface ToolDefinition {
  id?: string;
  name: string;
  description?: string;
  version?: string;
  permissions?: string[];
  endpoint?: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  authentication?: ToolAuthentication;
  execution?: ToolExecution;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface NormalizedToolDefinition {
  name: string;
  description: string;
  version: string;
  permissions: string[];
  endpoint: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  authentication: ToolAuthentication;
  execution: ToolExecution;
  metadata: Record<string, unknown>;
  extra: Record<string, unknown>;
}

export interface Fingerprint {
  algorithm: 'SHA-256';
  hash: string;
  canonicalJson: string;
}

export interface BaselineToolEntry {
  toolId: string;
  name: string;
  normalizedDefinition: NormalizedToolDefinition;
  fingerprint: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Baseline {
  baselineId: string;
  projectId: string;
  version: number;
  createdAt: string;
  createdBy: string;
  algorithm: 'SHA-256';
  tools: Record<string, BaselineToolEntry>;
  toolCount: number;
}

export interface DriftChange {
  path: string;
  type: 'added' | 'removed' | 'changed';
  before?: unknown;
  after?: unknown;
  severity: RiskSeverity;
  ruleId: string;
  reason: string;
  whyItMatters: string;
}

export type DriftEventStatus = 'open' | 'reviewed' | 'accepted' | 'resolved';

export interface DriftEvent {
  eventId: string;
  projectId: string;
  toolId: string;
  toolName: string;
  baselineId: string;
  scanId: string;
  detectedAt: string;
  changes: DriftChange[];
  severity: RiskSeverity;
  status: DriftEventStatus;
  acceptedBy?: string;
  acceptedAt?: string;
  resolvedReason?: string;
}

export type AuditActionType =
  | 'BASELINE_CREATED'
  | 'BASELINE_UPDATED'
  | 'SCAN_STARTED'
  | 'SCAN_COMPLETED'
  | 'DRIFT_DETECTED'
  | 'DRIFT_REVIEWED'
  | 'CHANGE_ACCEPTED'
  | 'PROJECT_CONNECTED'
  | 'SESSION_REVOKED';

export interface AuditEvent {
  auditId: string;
  action: AuditActionType;
  actorId: string;
  actorEmail?: string;
  projectId: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface ToolScanStatus {
  toolId: string;
  name: string;
  status: TrustStatus;
  driftDetected: boolean;
  fingerprint: string;
  baselineFingerprint?: string;
  changes: DriftChange[];
  lastChecked: string;
}

export interface ScanResult {
  scanId: string;
  projectId: string;
  scannedAt: string;
  totalTools: number;
  safeTools: number;
  driftCount: number;
  status: 'SAFE' | 'DRIFT_DETECTED' | 'ERROR';
  highestSeverity: RiskSeverity | 'none';
  tools: ToolScanStatus[];
  error?: string;
}

export interface Project {
  projectId: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  activeBaselineId?: string;
  settings: {
    scanFrequencyMinutes?: number;
    failOnSeverity?: RiskSeverity;
    autoAcceptMinorDescriptions?: boolean;
  };
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  createdAt: string;
}
