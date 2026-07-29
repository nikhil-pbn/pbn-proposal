/**
 * Exercises the Claude pipeline.
 *
 *   npm run claude:try
 *
 * With ANTHROPIC_API_KEY set it makes a real call against the sample transcript.
 * Without one it uses SAMPLE_EXTRACTION, so assembly and the guardrails are
 * still verified for free.
 */
import { SAMPLE_TRANSCRIPT } from "./sample-transcript";
import {
  generateExtraction,
  generationSource,
} from "@/server/proposal/generate";
import { extractionSchema } from "./extraction-schema";
import { assembleProposal } from "@/server/proposal/assemble-proposal";
import { buildDefaultProposal } from "@/server/proposal/default-proposal";
import { transcriptInputSchema } from "@/server/validation/transcript-input";
import { SECTION_LABELS, type ProposalContent } from "@/types/proposal";

const REP = { repName: "Kelly Geisser", repEmail: "kelly@practicenumbers.com" };
const PREPARED_ON = "March 19, 2026";

function summarise(content: ProposalContent) {
  console.log("assembled proposal");
  for (const section of [...content.sections].sort((a, b) => a.order - b.order)) {
    const data = section.data as Record<string, unknown>;
    const counts = Object.entries(data)
      .filter(([, v]) => Array.isArray(v))
      .map(([k, v]) => `${k}=${(v as unknown[]).length}`)
      .join(" ");
    console.log(
      `  ${String(section.order).padStart(2)}. ${SECTION_LABELS[section.type].padEnd(22)}` +
        `${section.visible ? "visible" : "HIDDEN "}  ${counts}`,
    );
  }
}

function planFingerprint(plans: { name: string; price: string; period: string }[]) {
  return plans.map((p) => `${p.name}|${p.price}|${p.period}`).join(" / ");
}

function addOnFingerprint(addOns: { name: string; price: string }[]) {
  return addOns.map((a) => `${a.name}|${a.price}`).join(" / ");
}

/** The guarantee that matters: the model cannot put a price in the document. */
function assertPricingUntouched(content: ProposalContent) {
  const expected = buildDefaultProposal().sections.find(
    (s) => s.type === "pricing",
  );
  const actual = content.sections.find((s) => s.type === "pricing");
  if (expected?.type !== "pricing" || actual?.type !== "pricing") {
    throw new Error("pricing section missing");
  }

  const plansMatch =
    planFingerprint(expected.data.plans) === planFingerprint(actual.data.plans);
  console.log(`\nguardrail: pricing plans unchanged  ${plansMatch ? "PASS" : "FAIL"}`);
  if (!plansMatch) throw new Error("pricing plans were modified during assembly");

  const addOnsMatch =
    addOnFingerprint(expected.data.addOns) ===
    addOnFingerprint(actual.data.addOns);
  console.log(`guardrail: add-ons unchanged         ${addOnsMatch ? "PASS" : "FAIL"}`);
  if (!addOnsMatch) throw new Error("add-ons were modified during assembly");
}

async function main() {
  const input = transcriptInputSchema.parse({
    ...REP,
    transcript: SAMPLE_TRANSCRIPT,
  });
  console.log(`input validated — transcript ${input.transcript.length} chars\n`);

  const source = generationSource();
  console.log(
    source === "claude"
      ? "engine: Claude (ANTHROPIC_API_KEY present)\n"
      : "engine: offline keyword matching (no ANTHROPIC_API_KEY)\n",
  );

  const started = Date.now();
  const { extraction } = await generateExtraction(input);
  const seconds = ((Date.now() - started) / 1000).toFixed(1);

  // The offline engine must satisfy exactly the same schema as Claude.
  extractionSchema.parse(extraction);

  console.log(`produced in ${seconds}s, schema-valid`);
  console.log(`practice: ${extraction.practiceName} — ${extraction.contactName}`);
  console.log(`headline: ${extraction.heroHeadline}`);
  console.log(
    `problems: ${extraction.problems.length}  solutions: ${extraction.solutions.length}  ` +
      `comparison rows: ${extraction.comparison.rows.length}  ` +
      `practice details: ${extraction.practiceDetails.length}`,
  );
  console.log(`modules: ${extraction.solutions.map((s) => s.module).join(", ")}`);
  console.log("detected facts:");
  for (const detail of extraction.practiceDetails) {
    console.log(`  ${detail.label}: ${detail.value}`);
  }
  console.log(`discussedPricing: ${extraction.discussedPricing ?? "(null)"}\n`);

  const content = assembleProposal({ extraction, ...REP, preparedOn: PREPARED_ON });
  summarise(content);
  assertPricingUntouched(content);

  const solutionSection = content.sections.find((s) => s.type === "solutions");
  if (solutionSection?.type === "solutions") {
    const linked = solutionSection.data.items.filter(
      (i) => i.solvesProblemIds.length > 0,
    ).length;
    console.log(
      `guardrail: solutions linked to problems  ${linked}/${solutionSection.data.items.length}`,
    );
  }

  console.log("\nOK — proposal validates against proposalContentSchema.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\nFAILED: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  });
