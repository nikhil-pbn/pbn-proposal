import type { ProposalExtraction } from "@/server/claude/extraction-schema";
import {
  PBN_COMPETITORS,
  PBN_OTHER_TOOLS,
  PBN_PMS_INTEGRATIONS,
  type PbnModule,
} from "@/server/claude/pbn-catalog";

/**
 * Offline proposal generation — no API key, no cost.
 *
 * This is keyword matching, not language understanding. It reads the transcript
 * for facts it can find reliably (names, the PMS, counts, which problem areas
 * were discussed) and assembles a proposal from a canned library keyed to those
 * areas. Output is the same `ProposalExtraction` shape Claude returns, so
 * everything downstream is identical.
 *
 * It is genuinely transcript-driven — a call about paperwork produces a
 * different proposal than one about no-shows — but it cannot paraphrase the
 * prospect's own words the way Claude does. Every section still needs a read
 * before sending.
 */

type ProblemTemplate = {
  key: string;
  keywords: string[];
  title: string;
  description: string;
  impact: string;
  module: PbnModule;
  solutionTitle: string;
  solutionDescription: string;
  bullets: string[];
  comparison: { capability: string; current: string; pbn: string };
};

const LIBRARY: ProblemTemplate[] = [
  {
    key: "scheduling",
    keywords: [
      "phone",
      "phones",
      "call",
      "calls",
      "book",
      "booking",
      "schedule",
      "scheduling",
      "front desk",
      "after hours",
      "voicemail",
      "closed at",
    ],
    title: "Every appointment goes through the front desk",
    description:
      "Booking and rescheduling happen by phone, during office hours only. When the line is busy or the practice is closed, the patient waits — and some of them don't call back.",
    impact: "Bookings lost outside office hours",
    module: "Patient Relationship Management",
    solutionTitle: "Let patients book and confirm themselves",
    solutionDescription:
      "Patients self-schedule against your real availability, at any hour, and every conversation lives in one shared place instead of on someone's personal phone.",
    bullets: [
      "Online Appointment Booking",
      "Two-Way Texting",
      "Patient Portal",
      "Patient Follow-Ups",
    ],
    comparison: {
      capability: "Appointment booking",
      current: "Phone only, during office hours",
      pbn: "Patient self-booking, any hour",
    },
  },
  {
    key: "noshows",
    keywords: [
      "no-show",
      "no show",
      "noshow",
      "remind",
      "reminder",
      "reminders",
      "cancel",
      "cancellation",
      "forget",
      "empty chair",
      "recall",
    ],
    title: "Reminders go out only when someone has time",
    description:
      "Reminders are sent manually and inconsistently, so patients forget. Empty chairs are discovered the same morning, with no time left to fill them.",
    impact: "Unrecovered chair time every week",
    module: "Patient Relationship Management",
    solutionTitle: "Automate reminders and recalls",
    solutionDescription:
      "Reminder, recall and reactivation sequences run on their own, so cutting no-shows stops depending on whether anyone had a spare twenty minutes.",
    bullets: [
      "Patient Reminders",
      "Patient Follow-Ups",
      "Campaign Suite (Essential, Advanced, Custom)",
    ],
    comparison: {
      capability: "Appointment reminders",
      current: "Manual and inconsistent",
      pbn: "Automated multi-step sequences",
    },
  },
  {
    key: "reporting",
    keywords: [
      "report",
      "reports",
      "production",
      "collection",
      "collections",
      "spreadsheet",
      "kpi",
      "analytics",
      "numbers",
      "month-end",
      "month end",
      "reconcile",
      "dashboard",
      "treatment plan",
      "pending treatment",
    ],
    title: "Performance numbers are assembled by hand",
    description:
      "Production, collections and outstanding treatment have to be pulled from reports and reconciled manually. By the time the picture is clear, the month is over.",
    impact: "Decisions made on last month's numbers",
    module: "Business Analytics",
    solutionTitle: "See production and collections as they happen",
    solutionDescription:
      "Real-time performance by provider and location, drawn from your practice management system — no report pulling, and diagnosed-but-unscheduled treatment surfaced rather than buried.",
    bullets: [
      "Practice IQ",
      "Revenue IQ",
      "Daily Huddle",
      "600+ tracked KPIs",
      "40+ patient segmentation filters",
    ],
    comparison: {
      capability: "Performance reporting",
      current: "Manual report pulls, monthly",
      pbn: "Real time, 600+ KPIs",
    },
  },
  {
    key: "paperwork",
    keywords: [
      "paper",
      "paperwork",
      "form",
      "forms",
      "clipboard",
      "intake",
      "re-key",
      "rekey",
      "handwriting",
      "typing it in",
      "type it in",
      "data entry",
    ],
    title: "Patient forms are re-keyed by hand",
    description:
      "New patients complete paper forms that someone then types into the chart. It costs staff time, delays the appointment, and misread handwriting introduces errors.",
    impact: "Staff hours lost to data entry",
    module: "Smart Forms",
    solutionTitle: "Replace paper with forms that write into the chart",
    solutionDescription:
      "Secure digital forms and kiosk check-in that sync back to your practice management system, so nothing is re-typed and nothing is misread.",
    bullets: [
      "Digital patient forms",
      "Forms synced to the practice management system",
      "Kiosk check-in",
    ],
    comparison: {
      capability: "Patient forms",
      current: "Paper, re-keyed by staff",
      pbn: "Digital, synced to the chart",
    },
  },
  {
    key: "insurance",
    keywords: [
      "insurance",
      "claim",
      "claims",
      "denial",
      "denied",
      "verification",
      "verify",
      "eligibility",
    ],
    title: "Insurance work is manual and error-prone",
    description:
      "Verification and claim detail are handled by hand, and mistakes surface later as denials and resubmissions.",
    impact: "Denials nobody is counting",
    module: "PbN AI",
    solutionTitle: "Summarise insurance detail automatically",
    solutionDescription:
      "Dense insurance information is condensed into a readable summary, and verification stops being a manual lookup.",
    bullets: ["Insurance Summary", "Form Summary", "AI Insights"],
    comparison: {
      capability: "Insurance handling",
      current: "Manual verification",
      pbn: "AI-summarised, verification automated",
    },
  },
  {
    key: "reviews",
    keywords: ["review", "reviews", "google", "reputation", "star", "rating"],
    title: "Reviews are requested ad hoc",
    description:
      "Happy patients aren't asked at the right moment, so online reputation doesn't reflect the quality of care.",
    impact: "Fewer new patients from search",
    module: "Patient Relationship Management",
    solutionTitle: "Ask for reviews at the right moment",
    solutionDescription:
      "Review requests trigger automatically after the right kind of visit, and incoming feedback is monitored and categorised.",
    bullets: ["Review Management", "Patient Follow-Ups"],
    comparison: {
      capability: "Review management",
      current: "Ad hoc requests",
      pbn: "Automated and monitored",
    },
  },
  {
    key: "payments",
    keywords: [
      "payment",
      "payments",
      "card",
      "terminal",
      "balance",
      "balances",
      "outstanding",
      "collect",
      "pay plan",
      "payment plan",
    ],
    title: "Payments sit outside the rest of the workflow",
    description:
      "Card processing and outstanding balances are tracked separately from everything else, so reconciliation is manual and follow-up is inconsistent.",
    impact: "Slower collections",
    module: "PbN Payments",
    solutionTitle: "Bring payments into the same platform",
    solutionDescription:
      "Card processing and payment plans run alongside scheduling and analytics, so balances are visible where the rest of the practice already lives.",
    bullets: ["Card processing", "Payment plans", "Transparent processing rates"],
    comparison: {
      capability: "Payments",
      current: "Separate terminal and reconciliation",
      pbn: "Integrated processing and plans",
    },
  },
];

function countMatches(haystack: string, keywords: string[]): number {
  let score = 0;
  for (const keyword of keywords) {
    // Count occurrences so a topic raised repeatedly outranks a passing mention.
    let index = haystack.indexOf(keyword);
    while (index !== -1) {
      score += 1;
      index = haystack.indexOf(keyword, index + keyword.length);
    }
  }
  return score;
}

function firstMatch(text: string, candidates: readonly string[]): string | null {
  const lower = text.toLowerCase();
  for (const candidate of candidates) {
    if (lower.includes(candidate.toLowerCase())) return candidate;
  }
  return null;
}

function allMatches(text: string, candidates: readonly string[]): string[] {
  const lower = text.toLowerCase();
  return candidates.filter((c) => lower.includes(c.toLowerCase()));
}

/** "Kelly Geisser: ..." speaker labels, in order of first appearance. */
function speakers(transcript: string): string[] {
  const found: string[] = [];
  const pattern = /^[ \t]*([A-Z][A-Za-z.'-]+(?: [A-Z][A-Za-z.'-]+){0,2})[ \t]*:/gm;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(transcript)) !== null) {
    const name = match[1].trim();
    if (!found.includes(name)) found.push(name);
  }
  return found;
}

/**
 * Finds the practice name, skipping vendor names.
 *
 * "Open Dental" and "Curve Dental" are practice management SYSTEMS but they end
 * in "Dental", so a naive match picks the PMS as the practice and the proposal
 * gets addressed to the wrong entity. Every catalog name is excluded.
 */
function detectPracticeName(transcript: string): string | null {
  const excluded = new Set(
    [...PBN_PMS_INTEGRATIONS, ...PBN_COMPETITORS].map((name) =>
      name.toLowerCase(),
    ),
  );

  const pattern =
    /\b([A-Z][A-Za-z&'-]+(?: [A-Z][A-Za-z&'-]+){0,3}\s(?:Dental(?: Group| Care| Arts)?|Dentistry|Orthodontics|Smiles))\b/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(transcript)) !== null) {
    const candidate = match[1].trim();
    if (!excluded.has(candidate.toLowerCase())) return candidate;
  }
  return null;
}

/**
 * Strips Zoom/Teams WEBVTT scaffolding.
 *
 * A real export looks like:
 *
 *   WEBVTT
 *
 *   1
 *   00:02:53.870 --> 00:02:56.470
 *   Kelly Geisser: Hey, is Dilly available?
 *
 * Left in place, the cue numbers and timestamps are thousands of stray digits
 * that corrupt every "how many X" match — `00:03:01.320` alone offers three
 * numbers to misread. Phone-number speaker labels are relabelled so the speaker
 * detector doesn't treat `13055425716` as a person's name.
 */
export function normalizeTranscript(input: string): string {
  const lines = input.split(/\r?\n/);
  const kept: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    if (/^WEBVTT/i.test(trimmed)) continue;
    if (/^NOTE\b/i.test(trimmed)) continue;
    // Cue sequence number on its own line.
    if (/^\d+$/.test(trimmed)) continue;
    // Timestamp line, with or without cue settings after it.
    if (/^\d{1,2}:\d{2}(:\d{2})?[.,]\d{1,3}\s*-->/.test(trimmed)) continue;

    // "13055425716: text" -> "Caller: text"
    kept.push(trimmed.replace(/^\+?\d[\d\s()-]{6,}\s*:/, "Caller:"));
  }

  return kept.join("\n");
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90,
};

/**
 * People say "six chairs" and "forty-five new patients", not "6" and "45".
 * Rewriting spelled numbers to digits before matching roughly triples how many
 * practice facts get picked up out of a real transcript.
 */
export function normalizeNumberWords(text: string): string {
  const tens = "twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety";
  const units = "one|two|three|four|five|six|seven|eight|nine";

  return (
    text
      // "forty-five" / "forty five" -> 45
      .replace(
        new RegExp(`\\b(${tens})[\\s-](${units})\\b`, "gi"),
        (_all, ten: string, unit: string) =>
          String(
            NUMBER_WORDS[ten.toLowerCase()] + NUMBER_WORDS[unit.toLowerCase()],
          ),
      )
      // single words
      .replace(
        new RegExp(`\\b(${Object.keys(NUMBER_WORDS).join("|")})\\b`, "gi"),
        (all) => String(NUMBER_WORDS[all.toLowerCase()] ?? all),
      )
  );
}

function detectNumber(transcript: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = pattern.exec(transcript);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function buildOfflineExtraction(input: {
  transcript: string;
  repName: string;
}): ProposalExtraction {
  // Strip WEBVTT scaffolding first — everything downstream assumes clean text.
  const raw = normalizeTranscript(input.transcript);
  const lower = raw.toLowerCase();

  // --- who and where -------------------------------------------------------
  const names = speakers(raw);
  const repFirstName = input.repName.split(/\s+/)[0]?.toLowerCase() ?? "";
  const namedSpeaker = names.find(
    (name) =>
      name !== "Caller" &&
      !name.toLowerCase().startsWith(repFirstName) &&
      name.toLowerCase() !== input.repName.toLowerCase(),
  );

  // Zoom labels the prospect by phone number surprisingly often, so fall back
  // to a name stated out loud ("her name is Kylie", "this is Dana").
  //
  // Must scan ALL matches, not just the first: the rep opens with "this is
  // Kelly Geisser", so taking the first hit only ever finds the rep.
  const repLast = input.repName.split(/\s+/).slice(1).join(" ").toLowerCase();
  const statedNames = [
    ...raw.matchAll(
      /(?:name is|this is|speaking with|you're speaking to)\s+([A-Z][a-z]{2,})\b/g,
    ),
  ]
    .map((match) => match[1])
    .filter((name) => {
      const lowerName = name.toLowerCase();
      return lowerName !== repFirstName && lowerName !== repLast;
    });

  const contactName = namedSpeaker ?? statedNames[0] ?? "there";

  const practiceName = detectPracticeName(raw) ?? "the practice";
  const pms = firstMatch(raw, PBN_PMS_INTEGRATIONS);
  // De-duplicate case variants (WorldPay / Worldpay) so the list reads cleanly.
  const competitors = [
    ...new Set(
      [
        ...allMatches(raw, PBN_COMPETITORS),
        ...allMatches(raw, PBN_OTHER_TOOLS),
      ].map((name) => name.toLowerCase()),
    ),
  ].map(
    (lowerName) =>
      [...PBN_COMPETITORS, ...PBN_OTHER_TOOLS].find(
        (name) => name.toLowerCase() === lowerName,
      ) ?? lowerName,
  );

  // Match against a digit-normalised copy so spelled-out numbers are found too.
  const numeric = normalizeNumberWords(raw);

  const chairs = detectNumber(numeric, [
    /(\d+)\s*(?:chairs|operatories|ops\b)/i,
  ]);
  const locations = detectNumber(numeric, [
    /(\d+)\s*locations?/i,
    // Real calls say "we have 3 offices", not "3 locations".
    /(\d+)\s*offices\b/i,
    /\b(single)\s+location/i,
  ]);
  const teamSize = detectNumber(numeric, [
    /(\d+)\s*(?:of us|staff|team members|employees|including hygiene)/i,
  ]);
  const frontDesk = detectNumber(numeric, [
    /(\d+)\s*front desks?\b/i,
    /front desk[^.]{0,20}?(\d+)\s*(?:persons?|people|staff)/i,
  ]);
  const patientsPerDay = detectNumber(numeric, [
    /(\d+)\s*(?:to|-|–)\s*\d+\s*patients\s*(?:a|per)\s*day/i,
    /(\d+)\s*patients\s*(?:a|per)\s*day/i,
  ]);
  const newPatients = detectNumber(numeric, [/(\d+)\s*new patients/i]);
  const doctors = detectNumber(numeric, [
    /(\d+)\s*(?:doctors|dentists|docs|providers)\b/i,
  ]);

  // --- which problems came up ---------------------------------------------
  const scored = LIBRARY.map((template) => ({
    template,
    score: countMatches(lower, template.keywords),
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  // Never produce an empty proposal: fall back to the three most common areas.
  const chosen = (
    scored.length > 0
      ? scored.slice(0, 5)
      : LIBRARY.slice(0, 3).map((template) => ({ template, score: 0 }))
  ).map((entry) => entry.template);

  // --- practice details ----------------------------------------------------
  const practiceDetails: { label: string; value: string }[] = [];
  if (pms) practiceDetails.push({ label: "Practice management system", value: pms });
  if (locations)
    practiceDetails.push({
      label: "Locations",
      value: locations.toLowerCase() === "single" ? "1" : locations,
    });
  if (chairs) practiceDetails.push({ label: "Operatories", value: `${chairs} chairs` });
  if (doctors) practiceDetails.push({ label: "Providers", value: doctors });
  if (patientsPerDay)
    practiceDetails.push({
      label: "Patients per day",
      value: `~${patientsPerDay}`,
    });
  if (frontDesk)
    practiceDetails.push({ label: "Front desk staff", value: frontDesk });
  if (teamSize) practiceDetails.push({ label: "Team size", value: teamSize });
  if (newPatients)
    practiceDetails.push({ label: "New patients per month", value: `~${newPatients}` });
  if (competitors.length > 0)
    practiceDetails.push({
      label: "Current tooling mentioned",
      value: competitors.join(", "),
    });

  // --- copy ----------------------------------------------------------------
  const keepPms = pms
    ? `Keep ${pms}. Lose the manual work around it.`
    : "Unify the work around your practice management system.";

  const summary: string[] = [
    pms
      ? `${practiceName} runs on ${pms}, and the work around it is still manual — ${chosen
          .slice(0, 2)
          .map((t) => t.title.toLowerCase())
          .join(", and ")}.`
      : `${practiceName} has the clinical side working, but the operational work around it is still manual.`,
    `Practice by Numbers sits on top of ${pms ?? "your existing system"} and closes those gaps: the routine work automates, and the numbers that tell you how the practice is performing become visible as they happen.`,
    pms
      ? `Nothing gets ripped out. ${pms} stays exactly where it is — PbN connects to it, and the manual steps in between disappear.`
      : "Nothing gets replaced. PbN connects to what you already run and removes the manual steps in between.",
  ];

  const problems = chosen.map((template) => ({
    title: template.title,
    description: template.description,
    impact: template.impact,
  }));

  // One solution per distinct module, so a module recommended for two problems
  // appears once with both links rather than twice.
  const byModule = new Map<PbnModule, { template: ProblemTemplate; indexes: number[] }>();
  chosen.forEach((template, index) => {
    const existing = byModule.get(template.module);
    if (existing) {
      existing.indexes.push(index);
      for (const bullet of template.bullets) {
        if (!existing.template.bullets.includes(bullet)) {
          existing.template = {
            ...existing.template,
            bullets: [...existing.template.bullets, bullet],
          };
        }
      }
    } else {
      byModule.set(template.module, { template: { ...template }, indexes: [index] });
    }
  });

  const solutions = [...byModule.values()].map(({ template, indexes }) => ({
    module: template.module,
    title: template.solutionTitle,
    description: template.solutionDescription,
    bullets: template.bullets,
    solvesProblemIndexes: indexes,
  }));

  const comparisonRows = chosen.map((template) => template.comparison);
  comparisonRows.push({
    capability: "Vendors to manage",
    current: competitors.length > 0 ? competitors.join(" + ") : "Multiple point tools",
    pbn: "One platform, one invoice",
  });

  const points: string[] = [];
  if (pms) points.push(`Staying on ${pms} is a requirement — PbN works alongside it.`);
  for (const template of chosen.slice(0, 3)) {
    points.push(`${template.title} — ${template.impact.toLowerCase()}.`);
  }
  if (competitors.length > 0)
    points.push(`Currently paying for: ${competitors.join(", ")}.`);
  points.push("Next step: review this proposal, then confirm scope and start date.");

  // Explicit pricing only. Anything else would be inventing a number, which is
  // exactly what this system must never do — key or no key.
  const priceMentioned = /\$\s?\d/.test(raw) || lower.includes("249");
  const discussedPricing = priceMentioned
    ? "Pricing was raised on the call. Analyze starts at $249/month; the exact figure for this scope follows once it is confirmed."
    : null;

  return {
    practiceName,
    contactName,
    heroHeadline: keepPms,
    heroSubheadline:
      "From scheduling to payments to insights, Practice by Numbers replaces scattered tools with one seamless platform that grows with you.",
    executiveSummary: summary,
    practiceDetails,
    problems,
    solutions,
    comparison: {
      currentLabel: pms ? `Today (${pms} + manual)` : "Today",
      rows: comparisonRows,
    },
    callSummary: {
      attendees: `${contactName} (${practiceName}), ${input.repName} (Practice by Numbers)`,
      points,
    },
    discussedPricing,
  };
}
