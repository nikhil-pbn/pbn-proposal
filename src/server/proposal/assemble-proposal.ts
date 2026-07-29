import type { ProposalExtraction } from "@/server/claude/extraction-schema";
import type { ProposalContent, ProposalSection } from "@/types/proposal";
import { proposalContentSchema } from "@/types/proposal";
import { buildDefaultProposal } from "./default-proposal";

/**
 * Merges Claude's extraction into the default proposal.
 *
 * The direction matters: we START from the default proposal (all real PbN
 * content — pricing, published stats, timeline, FAQ) and overwrite ONLY the
 * sections Claude is allowed to author. So the sections most dangerous to get
 * wrong are structurally out of the model's reach, rather than merely
 * discouraged by the prompt.
 *
 * Section ids, `order` and `type` are set here too, so the editor can rely on
 * them regardless of what the model returned.
 */

export function assembleProposal(args: {
  extraction: ProposalExtraction;
  repName: string;
  repEmail: string;
  /** Pre-formatted, e.g. "March 19, 2026". */
  preparedOn: string;
}): ProposalContent {
  const x = args.extraction;

  const base = buildDefaultProposal({
    practiceName: x.practiceName,
    contactName: x.contactName,
    repName: args.repName,
    repEmail: args.repEmail,
    preparedOn: args.preparedOn,
  });

  // Deterministic ids, so the editor's delete/reorder operations are stable.
  const problems = x.problems.map((problem, index) => ({
    id: `pr-${index + 1}`,
    title: problem.title,
    description: problem.description,
    impact: problem.impact,
  }));

  const solutions = x.solutions.map((solution, index) => ({
    id: `sol-${index + 1}`,
    module: solution.module,
    title: solution.title,
    description: solution.description,
    bullets: solution.bullets,
    // Drop out-of-range indexes rather than trusting the model's arithmetic —
    // a bad index would otherwise render a chip for a problem that isn't there.
    solvesProblemIds: solution.solvesProblemIndexes
      .filter((i) => Number.isInteger(i) && i >= 0 && i < problems.length)
      .map((i) => problems[i].id),
  }));

  const sections: ProposalSection[] = base.sections.map((section) => {
    switch (section.type) {
      case "hero":
        return {
          ...section,
          data: {
            ...section.data,
            headline: x.heroHeadline,
            subheadline: x.heroSubheadline,
          },
        };

      case "summary":
        return {
          ...section,
          visible: x.executiveSummary.length > 0,
          data: { ...section.data, paragraphs: x.executiveSummary },
        };

      case "practiceDetails":
        return {
          ...section,
          visible: x.practiceDetails.length > 0,
          data: {
            ...section.data,
            items: x.practiceDetails.map((item, index) => ({
              id: `pd-${index + 1}`,
              label: item.label,
              value: item.value,
            })),
          },
        };

      case "problems":
        return {
          ...section,
          visible: problems.length > 0,
          data: { ...section.data, items: problems },
        };

      case "solutions":
        return {
          ...section,
          visible: solutions.length > 0,
          data: { ...section.data, items: solutions },
        };

      case "comparison":
        return {
          ...section,
          visible: x.comparison.rows.length > 0,
          data: {
            ...section.data,
            currentLabel: x.comparison.currentLabel,
            // pbnLabel stays from the default — it's our own branding, not the
            // model's to reword.
            rows: x.comparison.rows.map((row, index) => ({
              id: `cmp-${index + 1}`,
              capability: row.capability,
              current: row.current,
              pbn: row.pbn,
            })),
          },
        };

      case "callSummary":
        return {
          ...section,
          visible: x.callSummary.points.length > 0,
          data: {
            ...section.data,
            meta: [
              { id: "cs-date", label: "Call date", value: args.preparedOn },
              {
                id: "cs-attendees",
                label: "Attendees",
                value: x.callSummary.attendees,
              },
            ],
            points: x.callSummary.points,
          },
        };

      case "pricing":
        // Plans, prices and add-ons are NOT touched. The only thing the model
        // contributes is a note about what was actually said on the call.
        return x.discussedPricing
          ? {
              ...section,
              data: {
                ...section.data,
                intro: `${section.data.intro ?? ""} Discussed on our call: ${x.discussedPricing}`.trim(),
              },
            }
          : section;

      // benefits / timeline / faq / cta are fixed PbN content — returned as-is.
      default:
        return section;
    }
  });

  // Parse rather than cast: this is the same gate the database write uses, so a
  // bad assembly fails here with a path, not later as a malformed landing page.
  return proposalContentSchema.parse({ sections });
}
