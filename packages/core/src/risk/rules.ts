import { DriftChange, RiskSeverity } from '@toolguard/shared';
import { RawDiffChange } from '../diff/differ.js';

export interface RiskEvaluationRule {
  id: string;
  name: string;
  applies: (change: RawDiffChange) => boolean;
  evaluate: (change: RawDiffChange) => {
    severity: RiskSeverity;
    reason: string;
    whyItMatters: string;
  };
}

export const RISK_RULES: RiskEvaluationRule[] = [
  // 1. Command execution enabled
  {
    id: 'CAPABILITY_EXECUTION_ADDED',
    name: 'Execution capability enabled',
    applies: (ch) => {
      return (
        (ch.path === 'execution.enabled' && ch.after === true && ch.before !== true) ||
        (ch.path.startsWith('permissions') && Array.isArray(ch.after) && ch.after.includes('execute') && (!Array.isArray(ch.before) || !ch.before.includes('execute')))
      );
    },
    evaluate: () => ({
      severity: 'high',
      reason: 'Command execution capability was granted to this tool.',
      whyItMatters: 'Arbitrary or shell execution allows the tool to run processes on your machine, which significantly expands the attack surface.'
    })
  },

  // 2. Write permissions added to read-only tool
  {
    id: 'CAPABILITY_WRITE_ADDED',
    name: 'Write capability added',
    applies: (ch) => {
      if (ch.path.startsWith('permissions') && Array.isArray(ch.after) && ch.after.includes('write')) {
        return !Array.isArray(ch.before) || !ch.before.includes('write');
      }
      return false;
    },
    evaluate: () => ({
      severity: 'high',
      reason: 'Write capability was added to a previously read-only tool.',
      whyItMatters: 'The tool gained write capability. The baseline previously allowed read access only. This requires review because the tool\'s ability to modify project data has increased.'
    })
  },

  // 3. Admin / Root capability added
  {
    id: 'CAPABILITY_ADMIN_ADDED',
    name: 'Administrative capability added',
    applies: (ch) => {
      if (ch.path.startsWith('permissions') && Array.isArray(ch.after) && (ch.after.includes('admin') || ch.after.includes('root') || ch.after.includes('sudo'))) {
        return !Array.isArray(ch.before) || (!ch.before.includes('admin') && !ch.before.includes('root') && !ch.before.includes('sudo'));
      }
      return false;
    },
    evaluate: () => ({
      severity: 'high',
      reason: 'Administrative or elevated privileges were requested by this tool.',
      whyItMatters: 'Elevated permissions bypass sandboxing and standard access boundaries, creating critical privilege escalation risks.'
    })
  },

  // 4. Network capability added
  {
    id: 'CAPABILITY_NETWORK_ADDED',
    name: 'Network access capability added',
    applies: (ch) => {
      if (ch.path.startsWith('permissions') && Array.isArray(ch.after) && ch.after.includes('network')) {
        return !Array.isArray(ch.before) || !ch.before.includes('network');
      }
      return false;
    },
    evaluate: () => ({
      severity: 'high',
      reason: 'Network egress capability was added to a previously local tool.',
      whyItMatters: 'Network access allows the tool to transmit workspace data to external endpoints or fetch untrusted remote code.'
    })
  },

  // 5. Endpoint change / expansion
  {
    id: 'ENDPOINT_EXPANDED',
    name: 'Endpoint altered or expanded to remote target',
    applies: (ch) => ch.path === 'endpoint' && typeof ch.after === 'string' && ch.after.length > 0,
    evaluate: (ch) => {
      const before = String(ch.before || '');
      const after = String(ch.after || '');
      const isRemote = after.startsWith('http://') || after.startsWith('https://');
      const wasLocal = before === 'local' || before === 'stdio' || before.startsWith('127.0.0.1') || before === '';

      if (wasLocal && isRemote) {
        return {
          severity: 'high',
          reason: `Tool endpoint redirected from local/restricted (${before || 'local'}) to remote external endpoint (${after}).`,
          whyItMatters: 'Redirecting tool calls to an external host enables potential data exfiltration or man-in-the-middle tampering.'
        };
      }

      return {
        severity: 'medium',
        reason: `Tool communication endpoint changed from "${before}" to "${after}".`,
        whyItMatters: 'Endpoint alterations can redirect sensitive payloads to unexpected services.'
      };
    }
  },

  // 6. Authentication requirement removed
  {
    id: 'AUTH_REQUIREMENT_REMOVED',
    name: 'Authentication requirement disabled',
    applies: (ch) => ch.path === 'authentication.required' && ch.before === true && ch.after === false,
    evaluate: () => ({
      severity: 'high',
      reason: 'Authentication requirement was disabled for this tool.',
      whyItMatters: 'Removing authentication allows unauthenticated actors or processes to invoke the tool without credential verification.'
    })
  },

  // 7. Schema parameter modifications
  {
    id: 'SCHEMA_INPUT_MODIFIED',
    name: 'Input schema signature modified',
    applies: (ch) => ch.path.startsWith('inputSchema'),
    evaluate: (ch) => ({
      severity: 'medium',
      reason: `Tool input schema parameter changed at "${ch.path}".`,
      whyItMatters: 'Input schema alterations may introduce parameters that accept command arguments, file paths, or bypass validation.'
    })
  },

  // 8. Description or prompt modified
  {
    id: 'DESCRIPTION_CHANGED',
    name: 'Tool description or prompt altered',
    applies: (ch) => ch.path === 'description',
    evaluate: () => ({
      severity: 'medium',
      reason: 'Tool description or AI prompt instructions were modified.',
      whyItMatters: 'For AI agents, altering tool descriptions directly affects how the model selects and utilizes the tool, potentially inducing unintended agent behaviors.'
    })
  },

  // 9. Version changed
  {
    id: 'VERSION_CHANGED',
    name: 'Tool version bumped',
    applies: (ch) => ch.path === 'version',
    evaluate: (ch) => ({
      severity: 'low',
      reason: `Tool version updated from ${ch.before || 'unspecified'} to ${ch.after}.`,
      whyItMatters: 'Version changes indicate an underlying package or manifest update.'
    })
  },

  // 10. Property removed
  {
    id: 'PROPERTY_REMOVED',
    name: 'Property removed from tool definition',
    applies: (ch) => ch.type === 'removed',
    evaluate: (ch) => ({
      severity: 'low',
      reason: `Property "${ch.path}" was removed from the tool definition.`,
      whyItMatters: 'Removing constraints or configurations may alter tool enforcement defaults.'
    })
  }
];

/**
 * Classifies a raw diff change using explainable security rules.
 */
export function evaluateChangeRisk(change: RawDiffChange): DriftChange {
  for (const rule of RISK_RULES) {
    if (rule.applies(change)) {
      const evaluation = rule.evaluate(change);
      return {
        path: change.path,
        type: change.type,
        before: change.before,
        after: change.after,
        severity: evaluation.severity,
        ruleId: rule.id,
        reason: evaluation.reason,
        whyItMatters: evaluation.whyItMatters
      };
    }
  }

  // Fallback rule for unspecified changes
  return {
    path: change.path,
    type: change.type,
    before: change.before,
    after: change.after,
    severity: 'low',
    ruleId: 'GENERIC_MODIFICATION',
    reason: `Property "${change.path}" was ${change.type}.`,
    whyItMatters: 'A configuration attribute changed compared to the trusted baseline.'
  };
}

/**
 * Aggregates a list of evaluated drift changes to determine the highest risk level.
 */
export function determineOverallSeverity(changes: DriftChange[]): RiskSeverity {
  if (changes.some(c => c.severity === 'high')) return 'high';
  if (changes.some(c => c.severity === 'medium')) return 'medium';
  return 'low';
}
