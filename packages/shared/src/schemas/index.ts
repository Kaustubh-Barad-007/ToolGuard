import { z } from 'zod';

export const ToolAuthenticationSchema = z.object({
  required: z.boolean().default(false),
  type: z.string().optional(),
  scopes: z.array(z.string()).optional()
});

export const ToolExecutionSchema = z.object({
  enabled: z.boolean().default(false),
  command: z.string().optional(),
  isolated: z.boolean().optional(),
  shell: z.boolean().optional(),
  timeoutMs: z.number().optional()
});

export const ToolDefinitionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Tool name is required'),
  description: z.string().optional(),
  version: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  endpoint: z.string().optional(),
  inputSchema: z.record(z.unknown()).optional(),
  outputSchema: z.record(z.unknown()).optional(),
  authentication: ToolAuthenticationSchema.optional(),
  execution: ToolExecutionSchema.optional(),
  metadata: z.record(z.unknown()).optional()
}).passthrough();

export const DriftChangeSchema = z.object({
  path: z.string(),
  type: z.enum(['added', 'removed', 'changed']),
  before: z.unknown().optional(),
  after: z.unknown().optional(),
  severity: z.enum(['low', 'medium', 'high']),
  ruleId: z.string(),
  reason: z.string(),
  whyItMatters: z.string()
});

export const BaselineToolEntrySchema = z.object({
  toolId: z.string(),
  name: z.string(),
  normalizedDefinition: z.record(z.unknown()),
  fingerprint: z.string().length(64),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string()
});

export const BaselineSchema = z.object({
  baselineId: z.string(),
  projectId: z.string(),
  version: z.number().int().positive(),
  createdAt: z.string(),
  createdBy: z.string(),
  algorithm: z.literal('SHA-256'),
  tools: z.record(BaselineToolEntrySchema),
  toolCount: z.number().int().nonnegative()
});

export const AcceptDriftRequestSchema = z.object({
  projectId: z.string(),
  eventId: z.string(),
  toolId: z.string(),
  actorId: z.string(),
  actorEmail: z.string().optional(),
  reason: z.string().optional()
});
