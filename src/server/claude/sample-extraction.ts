import type { ProposalExtraction } from "./extraction-schema";

/**
 * A realistic extraction, as if Claude had processed SAMPLE_TRANSCRIPT. Lets the
 * assembler, the editor and the landing page all be exercised without spending
 * tokens or needing an API key.
 */
export const SAMPLE_EXTRACTION: ProposalExtraction = {
  practiceName: "New Horizons Dental",
  contactName: "Noah Stella",
  heroHeadline: "Keep Dentrix. Lose the manual work around it.",
  heroSubheadline:
    "Online booking, automated reminders, digital intake and real-time numbers — running on top of the system you already have.",
  executiveSummary: [
    "New Horizons Dental runs two doctors and six chairs on Dentrix, and every appointment still goes through the front desk by phone.",
    "PbN connects to Dentrix and removes the manual steps: patients book themselves, reminders send on their own, forms arrive digitally, and production is visible as it happens.",
  ],
  practiceDetails: [
    { label: "Practice management system", value: "Dentrix (9 years)" },
    { label: "Locations", value: "1 — Beaverton" },
    { label: "Operatories", value: "6 chairs" },
    { label: "Team size", value: "12, including hygiene" },
    { label: "New patients per month", value: "~45" },
  ],
  problems: [
    {
      title: "Every appointment goes through the front desk",
      description:
        "Both lines are often busy, and the office closes at five — evening callers either try again tomorrow or don't.",
      impact: "Unmeasured lost bookings after hours",
    },
    {
      title: "Reminders happen only when someone has time",
      description:
        "A team member works tomorrow's schedule from her personal phone when the afternoon allows. On busy days it doesn't happen.",
      impact: "Two to three empty chairs, discovered same-morning",
    },
    {
      title: "Month-end reporting is assembled by hand",
      description:
        "Three Dentrix reports into a spreadsheet, reconciled against the bank — most of a day, and the month is over before anyone can act.",
      impact: "Roughly a day of manager time per month",
    },
    {
      title: "Paper intake is re-keyed into Dentrix",
      description:
        "Fifteen minutes per new patient, and misread handwriting puts wrong insurance details on claims.",
      impact: "Claim denials nobody is counting",
    },
  ],
  solutions: [
    {
      module: "Patient Relationship Management",
      title: "Let patients book and confirm themselves",
      description:
        "Booking, reminders and recalls stop being a person's job, and every conversation lives in one shared place instead of a personal phone.",
      bullets: [
        "Online Appointment Booking",
        "Patient Reminders",
        "Two-Way Texting",
        "Patient Follow-Ups",
      ],
      solvesProblemIndexes: [0, 1],
    },
    {
      module: "Business Analytics",
      title: "See production and outstanding treatment as it happens",
      description:
        "Real-time performance drawn from Dentrix, with diagnosed-but-unscheduled treatment surfaced instead of buried.",
      bullets: ["Practice IQ", "Revenue IQ", "Daily Huddle", "600+ tracked KPIs"],
      solvesProblemIndexes: [2],
    },
    {
      module: "Smart Forms",
      title: "Intake that writes itself into the chart",
      description:
        "Patients complete forms before arriving and responses sync into Dentrix, so nothing is re-typed or misread.",
      bullets: [
        "Digital patient forms",
        "Forms synced to the practice management system",
        "Kiosk check-in",
      ],
      solvesProblemIndexes: [3],
    },
    {
      module: "PbN Voice",
      title: "Phones with reporting attached",
      description:
        "Caller context on screen, and the call analytics needed to know what after-hours demand is actually worth.",
      bullets: [
        "PMS-integrated caller context",
        "Office phone analytics",
        "24/7 call answering",
      ],
      solvesProblemIndexes: [0],
    },
  ],
  comparison: {
    currentLabel: "Today (Dentrix + manual)",
    rows: [
      {
        capability: "Appointment booking",
        current: "Phone only, until 5pm",
        pbn: "Patient self-booking, any hour",
      },
      {
        capability: "Reminders",
        current: "Manual, from a personal phone",
        pbn: "Automated sequences",
      },
      {
        capability: "Patient forms",
        current: "Paper, re-keyed by staff",
        pbn: "Digital, synced to Dentrix",
      },
      {
        capability: "Reporting",
        current: "Three reports plus a spreadsheet, monthly",
        pbn: "Real time, 600+ KPIs",
      },
      {
        capability: "Outstanding treatment",
        current: "Known to exist, hard to query",
        pbn: "Surfaced by Revenue IQ",
      },
      {
        capability: "Call reporting",
        current: "None",
        pbn: "Transcribed and analysed",
      },
    ],
  },
  callSummary: {
    attendees:
      "Noah Stella (New Horizons Dental), Kelly Geisser (Practice by Numbers)",
    points: [
      "Staying on Dentrix is non-negotiable — PbN works alongside it.",
      "Phone-only scheduling and manual reminders are the two biggest costs.",
      "Month-end reporting takes most of a day and arrives too late to act on.",
      "Dr. Patel signs, and will ask about Dentrix and contract length first.",
      "Next step: proposal with the discussed scope, sent today.",
    ],
  },
  discussedPricing:
    "Analyze starts at $249/month; exact figure for the patient-communication scope to follow rather than be guessed on the call.",
};
