import { prisma } from "@/server/db";
import { hasAnthropicKey } from "@/server/claude/client";
import { GENERATION_MODES, generationConfig } from "@/server/proposal/generate";

/**
 * Reports degraded subsystems — but only the ones the calling page actually
 * depends on.
 *
 * Two rules, both learned the hard way:
 *
 *  1. Silence is dangerous. A 200 response with an error panel buried in the
 *     page reads as "working", which is how a dead database went unnoticed.
 *  2. Noise is also dangerous. Warning about the generation engine on a page
 *     that never generates anything trains you to dismiss toasts unread, which
 *     costs you the warning that mattered.
 *
 * So each page passes what it needs, and nothing else is checked or reported.
 */

export type Subsystem = "database" | "generation";

export type SystemIssue = {
  /** Stable id so repeated navigations don't stack duplicate toasts. */
  id: string;
  level: "error" | "warning" | "info";
  /** Short. Shown as the toast heading. */
  title: string;
  /** One terse technical line — a command or a cause, not a sentence. */
  detail: string;
  /** Verbose context. Console only; never shown in a toast. */
  debug?: string;
};

export type SystemStatus = {
  issues: SystemIssue[];
};

/**
 * @param needs Subsystems this page depends on. A page that only reads the
 *   tracking log passes `["database"]` — it has no opinion about Claude.
 */
export async function getSystemStatus(
  needs: Subsystem[],
): Promise<SystemStatus> {
  const issues: SystemIssue[] = [];

  if (needs.includes("database")) {
    try {
      // Cheapest round-trip that proves a real connection.
      await prisma.proposalTracking.count();
    } catch (error) {
      const raw = error instanceof Error ? error.message : String(error);
      const code = /ECONNREFUSED|P1001|Connection terminated/i.exec(raw)?.[0];
      issues.push({
        id: "db-down",
        level: "error",
        title: "Database unreachable",
        detail: `${code ?? "connection failed"} — run npm run db:dev`,
        debug: raw,
      });
    }
  }

  if (needs.includes("generation")) {
    const config = generationConfig();

    if (config.invalidValue) {
      // Reported instead of the offline warning below, not alongside it: this is
      // the cause, "offline" is just the symptom, and two toasts for one problem
      // is the noise rule above being broken.
      issues.push({
        id: "engine-misconfigured",
        level: "error",
        title: "Invalid PROPOSAL_GENERATION",
        detail: `"${config.invalidValue}" is not a mode — using offline`,
        debug:
          `PROPOSAL_GENERATION must be one of: ${GENERATION_MODES.join(", ")}. ` +
          `Got "${config.invalidValue}". Resolving to offline rather than Claude ` +
          "so a typo cannot start spending API credit.",
      });
    } else if (config.source === "offline") {
      const keyPresent = hasAnthropicKey();
      issues.push({
        id: "engine-offline",
        level: "warning",
        title: "Offline mode",
        detail: keyPresent
          ? "PROPOSAL_GENERATION=offline — keyword matching"
          : "No ANTHROPIC_API_KEY — keyword matching",
        debug:
          "Sections are produced by keyword matching against the PbN catalog, " +
          "not read by Claude. Wording needs review before sending. " +
          (keyPresent ? 'Set PROPOSAL_GENERATION="claude" to switch.' : ""),
      });
    }
  }

  logIssues(issues);
  return { issues };
}

/**
 * Prints to the `npm run dev` terminal as well as toasting in the browser, so a
 * degraded system is impossible to miss from either side.
 */
function logIssues(issues: SystemIssue[]): void {
  for (const issue of issues) {
    // Console gets the verbose version; the toast stays one short line.
    const line =
      `[system] ${issue.title}: ${issue.detail}` +
      (issue.debug ? `\n          ${issue.debug}` : "");
    if (issue.level === "error") console.error(line);
    else console.warn(line);
  }
}
