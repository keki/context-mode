/**
 * Claude Code formatter — converts routing decisions into Claude Code hook output format.
 *
 * Claude Code expects:
 *   { hookSpecificOutput: { hookEventName, permissionDecision?, reason?, updatedInput?, additionalContext? } }
 *
 * Decision shape from routing.mjs:
 *   - { action: "deny", reason: string }
 *   - { action: "ask" }
 *   - { action: "modify", updatedInput: object }
 *   - { action: "context", additionalContext: string }
 *   - null (passthrough)
 *
 * @param {object | null} decision - Normalized decision from routePreToolUse
 * @returns {object | null} Claude Code hook response, or null for passthrough
 */
export function formatDecision(decision) {
  if (!decision) return null;

  switch (decision.action) {
    case "deny":
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          reason: decision.reason ?? "Blocked by context-mode",
        },
      };

    case "ask":
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "ask",
        },
      };

    case "modify":
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          updatedInput: decision.updatedInput,
        },
      };

    case "context":
      // On Claude Code, additionalContext persists permanently as <system-reminder>
      // blocks in conversation history, compounding identical tips unbounded.
      // The ROUTING_BLOCK injected at SessionStart already covers all guidance,
      // so return null (passthrough) to avoid context waste.
      return null;

    default:
      return null;
  }
}
