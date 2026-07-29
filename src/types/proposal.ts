import { z } from "zod";

/**
 * The proposal is stored as JSON, never HTML. Every section carries its own
 * envelope (id / type / visible / order) so the editor can hide, delete and
 * reorder sections without ever calling Claude again.
 *
 * These schemas do triple duty:
 *   1. constrain Claude's output (structured outputs)
 *   2. validate the JSON before it is written to Postgres
 *   3. type the editor and the public landing page
 */

/* -------------------------------------------------------------------------- */
/*  Shared pieces                                                             */
/* -------------------------------------------------------------------------- */

export const ctaSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const labelledValueSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
});

/* -------------------------------------------------------------------------- */
/*  Section data shapes                                                       */
/* -------------------------------------------------------------------------- */

export const heroDataSchema = z.object({
  eyebrow: z.string(),
  headline: z.string(),
  subheadline: z.string(),
  practiceName: z.string(),
  contactName: z.string(),
  preparedByName: z.string(),
  preparedByEmail: z.string(),
  preparedOn: z.string(),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema.nullable(),
});

export const summaryDataSchema = z.object({
  heading: z.string(),
  paragraphs: z.array(z.string()),
});

export const practiceDetailsDataSchema = z.object({
  heading: z.string(),
  intro: z.string().nullable(),
  items: z.array(labelledValueSchema),
});

export const problemsDataSchema = z.object({
  heading: z.string(),
  intro: z.string().nullable(),
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      impact: z.string().nullable(),
    }),
  ),
});

export const solutionsDataSchema = z.object({
  heading: z.string(),
  intro: z.string().nullable(),
  items: z.array(
    z.object({
      id: z.string(),
      /** A real PbN module name, e.g. "PbN Voice", "Patient Relationship Management". */
      module: z.string(),
      title: z.string(),
      description: z.string(),
      bullets: z.array(z.string()),
      /** Which problems[].id this solves, for the "solves →" chip. */
      solvesProblemIds: z.array(z.string()),
    }),
  ),
});

export const comparisonDataSchema = z.object({
  heading: z.string(),
  intro: z.string().nullable(),
  currentLabel: z.string(),
  pbnLabel: z.string(),
  rows: z.array(
    z.object({
      id: z.string(),
      capability: z.string(),
      current: z.string(),
      pbn: z.string(),
    }),
  ),
});

export const benefitsDataSchema = z.object({
  heading: z.string(),
  intro: z.string().nullable(),
  /** Stat tiles. Keep to 3–4 — they are the scannable proof line. */
  metrics: z.array(
    z.object({
      id: z.string(),
      value: z.string(),
      label: z.string(),
      caption: z.string().nullable(),
    }),
  ),
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
    }),
  ),
});

export const pricingDataSchema = z.object({
  heading: z.string(),
  intro: z.string().nullable(),
  plans: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.string(),
      period: z.string(),
      description: z.string(),
      features: z.array(z.string()),
      recommended: z.boolean(),
    }),
  ),
  addOns: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.string(),
      note: z.string().nullable(),
    }),
  ),
  footnote: z.string().nullable(),
});

export const timelineDataSchema = z.object({
  heading: z.string(),
  intro: z.string().nullable(),
  phases: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      title: z.string(),
      description: z.string(),
      items: z.array(z.string()),
    }),
  ),
});

export const callSummaryDataSchema = z.object({
  heading: z.string(),
  intro: z.string().nullable(),
  meta: z.array(labelledValueSchema),
  points: z.array(z.string()),
});

export const faqDataSchema = z.object({
  heading: z.string(),
  intro: z.string().nullable(),
  items: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
    }),
  ),
});

export const ctaSectionDataSchema = z.object({
  heading: z.string(),
  subheading: z.string().nullable(),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema.nullable(),
  contactName: z.string().nullable(),
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
});

/* -------------------------------------------------------------------------- */
/*  Section envelope                                                          */
/* -------------------------------------------------------------------------- */

/** Every section carries these. `visible: false` hides without deleting. */
const envelope = {
  id: z.string(),
  visible: z.boolean(),
  order: z.number().int(),
};

export const sectionSchema = z.discriminatedUnion("type", [
  z.object({ ...envelope, type: z.literal("hero"), data: heroDataSchema }),
  z.object({ ...envelope, type: z.literal("summary"), data: summaryDataSchema }),
  z.object({
    ...envelope,
    type: z.literal("practiceDetails"),
    data: practiceDetailsDataSchema,
  }),
  z.object({
    ...envelope,
    type: z.literal("problems"),
    data: problemsDataSchema,
  }),
  z.object({
    ...envelope,
    type: z.literal("solutions"),
    data: solutionsDataSchema,
  }),
  z.object({
    ...envelope,
    type: z.literal("comparison"),
    data: comparisonDataSchema,
  }),
  z.object({
    ...envelope,
    type: z.literal("benefits"),
    data: benefitsDataSchema,
  }),
  z.object({ ...envelope, type: z.literal("pricing"), data: pricingDataSchema }),
  z.object({
    ...envelope,
    type: z.literal("timeline"),
    data: timelineDataSchema,
  }),
  z.object({
    ...envelope,
    type: z.literal("callSummary"),
    data: callSummaryDataSchema,
  }),
  z.object({ ...envelope, type: z.literal("faq"), data: faqDataSchema }),
  z.object({ ...envelope, type: z.literal("cta"), data: ctaSectionDataSchema }),
]);

export const proposalContentSchema = z.object({
  sections: z.array(sectionSchema),
});

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type Cta = z.infer<typeof ctaSchema>;
export type LabelledValue = z.infer<typeof labelledValueSchema>;

export type HeroData = z.infer<typeof heroDataSchema>;
export type SummaryData = z.infer<typeof summaryDataSchema>;
export type PracticeDetailsData = z.infer<typeof practiceDetailsDataSchema>;
export type ProblemsData = z.infer<typeof problemsDataSchema>;
export type SolutionsData = z.infer<typeof solutionsDataSchema>;
export type ComparisonData = z.infer<typeof comparisonDataSchema>;
export type BenefitsData = z.infer<typeof benefitsDataSchema>;
export type PricingData = z.infer<typeof pricingDataSchema>;
export type TimelineData = z.infer<typeof timelineDataSchema>;
export type CallSummaryData = z.infer<typeof callSummaryDataSchema>;
export type FaqData = z.infer<typeof faqDataSchema>;
export type CtaSectionData = z.infer<typeof ctaSectionDataSchema>;

export type ProposalSection = z.infer<typeof sectionSchema>;
export type SectionType = ProposalSection["type"];
export type ProposalContent = z.infer<typeof proposalContentSchema>;

/** Narrow a section to one variant, e.g. `SectionOf<"pricing">`. */
export type SectionOf<T extends SectionType> = Extract<
  ProposalSection,
  { type: T }
>;

/** Human labels for the editor's section toolbar. */
export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  summary: "Executive Summary",
  practiceDetails: "Practice Details",
  problems: "Top Problems",
  solutions: "Recommended Solutions",
  comparison: "Comparison",
  benefits: "Benefits",
  pricing: "Pricing",
  timeline: "Timeline",
  callSummary: "Call Summary",
  faq: "FAQ",
  cta: "Call to Action",
};

/** Sections in their default order, used when seeding a new proposal. */
export const SECTION_ORDER: SectionType[] = [
  "hero",
  "summary",
  "practiceDetails",
  "problems",
  "solutions",
  "comparison",
  "benefits",
  "pricing",
  "timeline",
  "callSummary",
  "faq",
  "cta",
];

/** Sections sorted by `order`, with hidden ones dropped. For public rendering. */
export function visibleSections(content: ProposalContent): ProposalSection[] {
  return content.sections
    .filter((section) => section.visible)
    .sort((a, b) => a.order - b.order);
}
