import type { ProposalContent } from "@/types/proposal";

/**
 * The default proposal.
 *
 * Two kinds of content live in here and they are treated differently:
 *
 *  - PbN content (module names, real published stats, real plan names, FAQ
 *    answers, implementation phases) is REAL and is meant to survive into every
 *    proposal. Claude should reuse it rather than invent alternatives.
 *  - Prospect content (practice name, contact, problems, practice details, call
 *    summary) is EXAMPLE data. Claude replaces it from the transcript.
 *
 * Pricing deliberately shows a real published figure for one plan and "Custom
 * quote" for the rest, because PbN does not publish those numbers. Never let a
 * generated proposal invent a price.
 */

export type DefaultProposalInput = {
  practiceName: string;
  contactName: string;
  repName: string;
  repEmail: string;
  /** Pre-formatted, e.g. "March 19, 2026". Passed in so builds stay deterministic. */
  preparedOn: string;
};

export const DEFAULT_PROPOSAL_INPUT: DefaultProposalInput = {
  practiceName: "New Horizons Dental",
  contactName: "Noah Stella",
  repName: "Kelly Geisser",
  repEmail: "kelly@practicenumbers.com",
  preparedOn: "March 19, 2026",
};

export function buildDefaultProposal(
  input: DefaultProposalInput = DEFAULT_PROPOSAL_INPUT,
): ProposalContent {
  const { practiceName, contactName, repName, repEmail, preparedOn } = input;

  return {
    sections: [
      {
        id: "hero",
        type: "hero",
        visible: true,
        order: 1,
        data: {
          eyebrow: `Prepared for ${practiceName}`,
          headline:
            "Unify and simplify every part of your practice operations",
          subheadline:
            "From scheduling to payments to insights, Practice by Numbers replaces scattered tools with one seamless platform that grows with you.",
          practiceName,
          contactName,
          preparedByName: repName,
          preparedByEmail: repEmail,
          preparedOn,
          primaryCta: { label: "Book your onboarding call", href: "#next-steps" },
          secondaryCta: { label: "See pricing", href: "#pricing" },
        },
      },

      {
        id: "summary",
        type: "summary",
        visible: true,
        order: 2,
        data: {
          heading: "Executive summary",
          paragraphs: [
            `${practiceName} is running a capable practice management system, but the work around it is still manual. Scheduling happens over the phone, reminders go out by hand when someone has time, and the numbers that tell you how the practice is performing live in reports that have to be pulled and stitched together.`,
            "Practice by Numbers sits on top of your existing PMS and closes those gaps. Patients book and confirm themselves, reminders and recalls run automatically, forms arrive digitally and sync straight into the chart, and production and collections are visible in real time instead of at month end.",
            "Nothing gets ripped out. Your PMS stays exactly where it is — PbN connects to it, and the manual steps in between disappear.",
          ],
        },
      },

      {
        id: "practiceDetails",
        type: "practiceDetails",
        visible: true,
        order: 3,
        data: {
          heading: "What we learned about your practice",
          intro:
            "Captured on our call. Correct anything that looks off before you send this along.",
          items: [
            {
              id: "pd-pms",
              label: "Practice management system",
              value: "Dentrix",
            },
            { id: "pd-locations", label: "Locations", value: "1" },
            { id: "pd-operatories", label: "Operatories", value: "6 chairs" },
            { id: "pd-team", label: "Team size", value: "12" },
            {
              id: "pd-newpatients",
              label: "New patients per month",
              value: "~45",
            },
            {
              id: "pd-tools",
              label: "Current tooling",
              value: "Phone scheduling, paper forms, manual recall calls",
            },
          ],
        },
      },

      {
        id: "problems",
        type: "problems",
        visible: true,
        order: 4,
        data: {
          heading: "What's getting in the way",
          intro: "The four things you told us cost the most time and revenue.",
          items: [
            {
              id: "pr-scheduling",
              title: "Scheduling runs through the front desk",
              description:
                "Every appointment is booked or moved by phone. When the line is busy or the office is closed, the patient waits — and some of them don't call back.",
              impact: "Lost bookings outside office hours",
            },
            {
              id: "pr-noshows",
              title: "No-shows and last-minute cancellations",
              description:
                "Reminders go out manually and inconsistently, so patients forget. Empty chairs get discovered the same morning, with no time to fill them.",
              impact: "Unrecovered chair time every week",
            },
            {
              id: "pr-visibility",
              title: "No real-time view of performance",
              description:
                "Production, collections and case acceptance have to be pulled from reports and reconciled by hand. By the time the picture is clear, the month is over.",
              impact: "Decisions made on last month's numbers",
            },
            {
              id: "pr-paperwork",
              title: "Paper forms re-keyed by hand",
              description:
                "New patients fill out paper at the front desk and someone types it into the chart. It costs staff time, delays the appointment, and introduces transcription errors.",
              impact: "Staff hours lost to data entry",
            },
          ],
        },
      },

      {
        id: "solutions",
        type: "solutions",
        visible: true,
        order: 5,
        data: {
          heading: "What we recommend",
          intro:
            "Each module below maps directly to one of the problems above. All of it runs on top of your existing PMS.",
          items: [
            {
              id: "sol-prm",
              module: "Patient Relationship Management",
              title: "Let patients book and confirm themselves",
              description:
                "One place for every patient conversation, fully synced with your practice management software. Booking, reminders, recalls and two-way texting stop being someone's job.",
              bullets: [
                "Online Appointment Booking — patients self-schedule against your real availability, day or night",
                "Patient Reminders — smart, automated reminder sequences that cut no-shows",
                "Two-Way Texting — the whole team works one shared inbox instead of personal phones",
                "Patient Follow-Ups — recalls, reactivations and post-op campaigns run on their own",
                "Review Management — happy patients get asked at the right moment",
              ],
              solvesProblemIds: ["pr-scheduling", "pr-noshows"],
            },
            {
              id: "sol-analytics",
              module: "Business Analytics",
              title: "See production and collections as they happen",
              description:
                "Real-time performance by provider, team member and location, drawn from your PMS, QuickBooks and your phones — no manual report pulling.",
              bullets: [
                "Practice IQ — data-driven insight across 600+ tracked KPIs",
                "Revenue IQ — surfaces revenue gaps using 40+ patient segmentation filters",
                "Daily Huddle — an automated morning brief on production goals, new patients, pending treatment and outstanding balances",
                "Track reappointment rate, pending treatment and case acceptance without building a report",
              ],
              solvesProblemIds: ["pr-visibility"],
            },
            {
              id: "sol-smartforms",
              module: "Smart Forms",
              title: "Replace paper with forms that write themselves into the chart",
              description:
                "Secure digital forms and kiosk check-in that sync back to your PMS, so nothing is re-typed and nothing is misread.",
              bullets: [
                "Patients complete intake before they arrive",
                "Responses sync directly into the patient record",
                "Kiosk check-in for walk-ins and same-day additions",
              ],
              solvesProblemIds: ["pr-paperwork"],
            },
            {
              id: "sol-ai",
              module: "PbN AI",
              title: "Take the admin load off the front desk",
              description:
                "AI handles the summarizing, drafting and reviewing your team currently does by hand.",
              bullets: [
                "Call Transcription and Call Summaries — review a patient call in seconds",
                "Form Summary — key details from patient submissions surfaced automatically",
                "Insurance Summary — dense insurance detail condensed into a readable summary",
                "Content Writer — personalized patient messages drafted in a click",
              ],
              solvesProblemIds: ["pr-paperwork", "pr-visibility"],
            },
            {
              id: "sol-voice",
              module: "PbN Voice",
              title: "A phone system that knows who's calling",
              description:
                "A cloud phone system built for dental practices, integrated with your PMS so patient context is on screen the moment the call connects.",
              bullets: [
                "Instant access to the patient record on inbound calls",
                "Make and receive practice calls from anywhere",
                "Office phone analytics alongside the rest of your KPIs",
                "24/7 call answering so no patient call goes unanswered",
              ],
              solvesProblemIds: ["pr-scheduling"],
            },
          ],
        },
      },

      {
        id: "comparison",
        type: "comparison",
        visible: true,
        order: 6,
        data: {
          heading: "Where you are today vs. with PbN",
          intro: null,
          currentLabel: "Today (Dentrix + manual)",
          pbnLabel: "With Practice by Numbers",
          rows: [
            {
              id: "cmp-booking",
              capability: "Appointment booking",
              current: "Phone only, during office hours",
              pbn: "Patient self-booking, 24/7",
            },
            {
              id: "cmp-reminders",
              capability: "Appointment reminders",
              current: "Manual, inconsistent",
              pbn: "Automated multi-step sequences",
            },
            {
              id: "cmp-texting",
              capability: "Patient texting",
              current: "Personal cell phones",
              pbn: "Shared two-way inbox",
            },
            {
              id: "cmp-forms",
              capability: "Patient forms",
              current: "Paper, re-keyed by staff",
              pbn: "Digital, synced to the chart",
            },
            {
              id: "cmp-analytics",
              capability: "Performance reporting",
              current: "Manual report pulls, monthly",
              pbn: "Real time, 600+ KPIs",
            },
            {
              id: "cmp-calls",
              capability: "Call handling",
              current: "No recording or analytics",
              pbn: "Transcribed, summarized, scored",
            },
            {
              id: "cmp-reviews",
              capability: "Review management",
              current: "Ad hoc requests",
              pbn: "Automated, monitored, categorized",
            },
            {
              id: "cmp-payments",
              capability: "Payments",
              current: "Terminal, separate reconciliation",
              pbn: "Integrated card processing and payment plans",
            },
            {
              id: "cmp-vendors",
              capability: "Vendors to manage",
              current: "Multiple point tools",
              pbn: "One platform, one invoice",
            },
          ],
        },
      },

      {
        id: "benefits",
        type: "benefits",
        visible: true,
        order: 7,
        data: {
          heading: "What practices see with PbN",
          intro:
            "Published results across the 5,000+ dental providers running Practice by Numbers.",
          metrics: [
            {
              id: "mt-hours",
              value: "375+",
              label: "Hours saved annually",
              caption: "Manual work removed from the front desk",
            },
            {
              id: "mt-denials",
              value: "32%",
              label: "Fewer claim denials",
              caption: "Cleaner data going out the door",
            },
            {
              id: "mt-reviews",
              value: "40%",
              label: "More positive reviews",
              caption: "Asked at the right moment, automatically",
            },
            {
              id: "mt-chairs",
              value: "48+",
              label: "Additional chairs filled",
              caption: "Recovered from no-shows and open recall",
            },
          ],
          items: [
            {
              id: "bn-revenue",
              title: "15–20% average revenue increase",
              description:
                "Typical across analytics-driven practices, with a 25% improvement in production-to-collection ratios.",
            },
            {
              id: "bn-insurance",
              title: "48% more insurance acceptance",
              description:
                "AI-summarized insurance detail means fewer errors and fewer resubmissions.",
            },
            {
              id: "bn-consolidation",
              title: "One platform instead of five",
              description:
                "Analytics, communication, forms, phones and payments consolidate — one vendor, one login, one bill.",
            },
            {
              id: "bn-team",
              title: "Your team back on patients",
              description:
                "Routine work automates, so the front desk spends its day on people in the chair rather than paperwork.",
            },
          ],
        },
      },

      {
        id: "pricing",
        type: "pricing",
        visible: true,
        order: 8,
        data: {
          heading: "Your investment",
          intro:
            "PbN is modular — you pay for the tools you actually use, and add more as the practice grows.",
          plans: [
            {
              id: "plan-analyze",
              name: "Analyze",
              price: "$249",
              period: "per month, starting at",
              description:
                "Essential analytics and practice performance visibility.",
              features: [
                "Core business analytics",
                "Practice performance dashboards",
                "Actionable insights",
              ],
              recommended: false,
            },
            {
              id: "plan-flow",
              name: "Flow",
              price: "Custom quote",
              period: "billed monthly or annually",
              description:
                "Everything in Core, plus the patient communication layer. Our recommendation for a practice your size.",
              features: [
                "Core analytics and patient engagement",
                "Smart Forms",
                "Online Appointment Booking",
                "Advanced patient campaigns",
                "Web chat and team messaging",
              ],
              recommended: true,
            },
            {
              id: "plan-scale",
              name: "Scale",
              price: "Custom quote",
              period: "billed monthly or annually",
              description:
                "For multi-location groups needing deeper analytics and automation.",
              features: [
                "Everything in Flow",
                "Practice IQ and Revenue IQ",
                "Expanded automation",
                "Advanced task management",
                "Multi-location support",
              ],
              recommended: false,
            },
            {
              id: "plan-thrive",
              name: "Thrive",
              price: "Custom quote",
              period: "billed monthly or annually",
              description: "The complete platform, everything switched on.",
              features: [
                "All analytics modules",
                "All campaign tiers",
                "PbN Voice",
                "PbN Payments",
                "PbN AI features",
              ],
              recommended: false,
            },
          ],
          addOns: [
            { id: "ao-practiceiq", name: "Practice IQ", price: "Add-on", note: null },
            { id: "ao-revenueiq", name: "Revenue IQ", price: "Add-on", note: null },
            {
              id: "ao-marketingiq",
              name: "Marketing IQ",
              price: "Add-on",
              note: null,
            },
            { id: "ao-voice", name: "PbN Voice", price: "Add-on", note: null },
            {
              id: "ao-payments",
              name: "PbN Payments",
              price: "Add-on",
              note: "Transparent processing rates, no hidden fees",
            },
            {
              id: "ao-insurance",
              name: "Insurance Verification",
              price: "Metered",
              note: "Priced per verification",
            },
          ],
          footnote:
            "No hidden charges. Monthly and annual agreements available — most practices choose annual for the savings. Solo practices, multi-location groups and DSOs are each quoted to fit, so you never pay for locations or features you don't use.",
        },
      },

      {
        id: "timeline",
        type: "timeline",
        visible: true,
        order: 9,
        data: {
          heading: "How rollout works",
          intro:
            "Most practices are live inside a month, with no downtime and no change to your PMS.",
          phases: [
            {
              id: "ph-kickoff",
              label: "Week 1",
              title: "Kickoff and PMS sync",
              description:
                "We connect PbN to your practice management system and confirm your data is flowing correctly.",
              items: [
                "Onboarding call with your implementation specialist",
                "PMS integration configured and verified",
                "Locations, providers and operatories mapped",
              ],
            },
            {
              id: "ph-config",
              label: "Weeks 2–3",
              title: "Configuration",
              description:
                "We build your reminder sequences, forms and dashboards to match how your practice actually runs.",
              items: [
                "Reminder and recall sequences written and scheduled",
                "Smart Forms built for your intake process",
                "Dashboards and KPI targets set with you",
              ],
            },
            {
              id: "ph-training",
              label: "Week 4",
              title: "Team training",
              description:
                "Role-based training so the front desk, clinical team and ownership each learn only what they need.",
              items: [
                "Live sessions by role",
                "PbN Learn access for the whole team",
                "Daily Huddle introduced to the morning routine",
              ],
            },
            {
              id: "ph-live",
              label: "Week 5 onward",
              title: "Go live and optimize",
              description:
                "You're live. We stay involved to tune what's working and expand what's paying off.",
              items: [
                "Launch with your specialist on hand",
                "30-day review against your baseline numbers",
                "Ongoing optimization and support",
              ],
            },
          ],
        },
      },

      {
        id: "callSummary",
        type: "callSummary",
        visible: true,
        order: 10,
        data: {
          heading: "Summary of our call",
          intro: null,
          meta: [
            { id: "cs-date", label: "Call date", value: preparedOn },
            {
              id: "cs-attendees",
              label: "Attendees",
              value: `${contactName} (${practiceName}), ${repName} (Practice by Numbers)`,
            },
          ],
          points: [
            "You are on Dentrix and want to keep it — any new tooling has to work alongside it, not replace it.",
            "Scheduling is the biggest bottleneck; the front desk is on the phone all day and after-hours requests get missed.",
            "No-shows are a recurring cost and there is no automated reminder process in place today.",
            "You want production and collections visible without pulling and reconciling reports by hand.",
            "Digital intake forms were called out as an immediate win for staff time.",
            "Next step agreed: review this proposal internally, then a follow-up to confirm scope and start date.",
          ],
        },
      },

      {
        id: "faq",
        type: "faq",
        visible: true,
        order: 11,
        data: {
          heading: "Questions you may have",
          intro: null,
          items: [
            {
              id: "faq-pms",
              question: "Do we have to leave Dentrix?",
              answer:
                "No. PbN integrates with Dentrix and works alongside it. We also integrate with Dentrix Ascend, Open Dental, EagleSoft, Practice-Web and Curve Dental, among 40+ practice management systems.",
            },
            {
              id: "faq-timeline",
              question: "How long does implementation take?",
              answer:
                "Most practices are live within about four weeks: integration in week one, configuration through weeks two and three, team training in week four. There is no downtime for your practice.",
            },
            {
              id: "faq-replace",
              question: "Which of our current tools does this replace?",
              answer:
                "PbN consolidates analytics, patient communication, digital forms, phones and payments into one platform. Practices commonly retire separate reminder, review, forms and phone vendors after switching.",
            },
            {
              id: "faq-training",
              question: "How much training will our team need?",
              answer:
                "Training is role-based and delivered live, so each person learns only their part. PbN Learn gives the team ongoing access to skills and insights content afterward.",
            },
            {
              id: "faq-contract",
              question: "Are we locked into a contract?",
              answer:
                "Both monthly and annual agreements are available. Many practices choose annual for the cost savings, but it is not a requirement.",
            },
            {
              id: "faq-pricing",
              question: "Why is only one plan showing a price?",
              answer:
                "PbN pricing is modular and quoted to your practice — size, locations and the modules you actually want all factor in. Analyze starts at $249/month; the rest we will quote precisely once we confirm scope on our next call.",
            },
          ],
        },
      },

      {
        id: "cta",
        type: "cta",
        visible: true,
        order: 12,
        data: {
          heading: `Ready when you are, ${contactName.split(" ")[0]}`,
          subheading:
            "Book the onboarding call and we will confirm scope, finalize your quote and set a start date.",
          primaryCta: { label: "Book your onboarding call", href: "#" },
          secondaryCta: { label: "Email me a question", href: `mailto:${repEmail}` },
          contactName: repName,
          contactEmail: repEmail,
          contactPhone: null,
        },
      },
    ],
  };
}

/** Fully-populated example proposal, used by the /preview design route. */
export const DEFAULT_PROPOSAL: ProposalContent = buildDefaultProposal();
