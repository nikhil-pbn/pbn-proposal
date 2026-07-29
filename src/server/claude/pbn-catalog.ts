/**
 * The fixed, real facts about Practice by Numbers.
 *
 * This is the guardrail against invention. Claude may only pick module names,
 * feature names and integrations from these lists — it must never coin a
 * product name, and it never sets prices (pricing comes from the default
 * proposal, not from the model).
 *
 * Sourced from practicenumbers.com. If the product changes, change it here and
 * the prompt updates with it.
 */

export const PBN_MODULES = [
  "Business Analytics",
  "Patient Relationship Management",
  "Operational Efficiency",
  "PbN AI",
  "Smart Forms",
  "Dental Marketing Suite",
  "PbN Payments",
  "PbN Voice",
] as const;

export type PbnModule = (typeof PBN_MODULES)[number];

/** Real sub-features per module — the only feature names that may appear in bullets. */
export const PBN_MODULE_FEATURES: Record<PbnModule, string[]> = {
  "Business Analytics": [
    "Practice IQ",
    "Revenue IQ",
    "Enterprise Dashboard",
    "Daily Huddle",
    "600+ tracked KPIs",
    "40+ patient segmentation filters",
  ],
  "Patient Relationship Management": [
    "Patient Reminders",
    "Two-Way Texting",
    "Patient Follow-Ups",
    "Online Appointment Booking",
    "Patient Portal",
    "Review Management",
    "Campaign Suite (Essential, Advanced, Custom)",
  ],
  "Operational Efficiency": [
    "Workflow automation",
    "Task management",
    "Insurance verification",
  ],
  "PbN AI": [
    "Call Transcription",
    "Call Summaries",
    "Sentiment Analysis",
    "Form Summary",
    "Insurance Summary",
    "Content Writer",
    "AI Insights",
    "Review Manager",
    "Revenue Finder",
    "AI-Powered Translation",
  ],
  "Smart Forms": [
    "Digital patient forms",
    "Kiosk check-in",
    "Forms synced to the practice management system",
  ],
  "Dental Marketing Suite": [
    "Campaign management",
    "Marketing ROI tracking",
    "Marketing IQ",
  ],
  "PbN Payments": [
    "Card processing",
    "Payment plans",
    "Transparent processing rates",
  ],
  "PbN Voice": [
    "Cloud-based VoIP phone system",
    "PMS-integrated caller context",
    "Office phone analytics",
    "24/7 call answering",
  ],
};

/**
 * Practice management systems PbN integrates with. When a transcript names one,
 * it is the prospect's CURRENT system — the left column of the comparison table.
 */
export const PBN_PMS_INTEGRATIONS = [
  "Dentrix",
  "Dentrix Ascend",
  "Practice-Web",
  "EagleSoft",
  "Open Dental",
  "Curve Dental",
] as const;

/** Competing point solutions a prospect may already be paying for. */
export const PBN_COMPETITORS = [
  "Weave",
  "NexHealth",
  "RevenueWell",
  "Dental Intel",
  "Flex Dental",
  "Adit",
  "YAPI",
  "Solutionreach",
  "Lighthouse360",
] as const;

/**
 * Other point tools that turn up on real calls but aren't on PbN's own
 * competitor page — payment processors, forms vendors, and so on. Detected so
 * the "vendors to manage" comparison row reflects what the prospect actually
 * pays for.
 */
export const PBN_OTHER_TOOLS = [
  "mConsent",
  "WorldPay",
  "Worldpay",
  "Square",
  "Stripe",
  "CareCredit",
  "Sunbit",
  "Podium",
  "Swell",
  "Modento",
  "Legwork",
  "Dental Intelligence",
] as const;

/** Published outcome figures. The only statistics that may appear in a proposal. */
export const PBN_PUBLISHED_STATS = [
  "375+ hours saved annually",
  "32% decrease in claim denials",
  "40% more positive patient reviews",
  "48+ additional chairs filled",
  "15–20% average revenue increase for analytics-driven practices",
  "25% improvement in production-to-collection ratios",
  "48% more insurance acceptance",
  "Trusted by 5,000+ dental providers",
  "40+ practice management system integrations",
] as const;

/**
 * The ONLY price that may ever appear in generated copy. Every other plan is
 * quoted after scope confirmation — see the pricing section of the default
 * proposal, which the model does not write.
 */
export const PBN_PUBLISHED_PRICE = "$249/month (Analyze plan, starting price)";

/** Plan names, for reference in prose only — never with invented prices attached. */
export const PBN_PLAN_NAMES = [
  "Analyze",
  "Core",
  "Flow",
  "Scale",
  "Thrive",
] as const;
