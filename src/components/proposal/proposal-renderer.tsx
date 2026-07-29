import { visibleSections, type ProposalContent } from "@/types/proposal";
import { ProposalNav } from "./proposal-nav";
import { HeroSection } from "./hero-section";
import { SummarySection } from "./summary-section";
import { PracticeDetailsSection } from "./practice-details-section";
import { ProblemsSection } from "./problems-section";
import { SolutionsSection } from "./solutions-section";
import { ComparisonSection } from "./comparison-section";
import { BenefitsSection } from "./benefits-section";
import { PricingSection } from "./pricing-section";
import { TimelineSection } from "./timeline-section";
import { CallSummarySection } from "./call-summary-section";
import { FaqSection } from "./faq-section";
import { CtaSection } from "./cta-section";

/**
 * Renders a proposal from its JSON. This same component backs the public
 * landing page, the editor preview, and the /preview design route — so what a
 * rep sees while editing is exactly what the prospect gets.
 */
export function ProposalRenderer({ content }: { content: ProposalContent }) {
  const sections = visibleSections(content);

  const hero = sections.find((section) => section.type === "hero");
  const problems = sections.find((section) => section.type === "problems");
  const practiceName = hero?.data.practiceName ?? "Proposal";

  return (
    <>
      <ProposalNav practiceName={practiceName} sections={sections} />

      <main>
        {sections.map((section) => {
          switch (section.type) {
            case "hero":
              return (
                <HeroSection key={section.id} id={section.id} data={section.data} />
              );
            case "summary":
              return (
                <SummarySection
                  key={section.id}
                  id={section.id}
                  data={section.data}
                />
              );
            case "practiceDetails":
              return (
                <PracticeDetailsSection
                  key={section.id}
                  id={section.id}
                  data={section.data}
                />
              );
            case "problems":
              return (
                <ProblemsSection
                  key={section.id}
                  id={section.id}
                  data={section.data}
                />
              );
            case "solutions":
              return (
                <SolutionsSection
                  key={section.id}
                  id={section.id}
                  data={section.data}
                  problems={problems?.data}
                />
              );
            case "comparison":
              return (
                <ComparisonSection
                  key={section.id}
                  id={section.id}
                  data={section.data}
                />
              );
            case "benefits":
              return (
                <BenefitsSection
                  key={section.id}
                  id={section.id}
                  data={section.data}
                />
              );
            case "pricing":
              return (
                <PricingSection
                  key={section.id}
                  id={section.id}
                  data={section.data}
                />
              );
            case "timeline":
              return (
                <TimelineSection
                  key={section.id}
                  id={section.id}
                  data={section.data}
                />
              );
            case "callSummary":
              return (
                <CallSummarySection
                  key={section.id}
                  id={section.id}
                  data={section.data}
                />
              );
            case "faq":
              return (
                <FaqSection key={section.id} id={section.id} data={section.data} />
              );
            case "cta":
              /* The nav and hero CTAs both target #next-steps. */
              return (
                <div key={section.id} id="next-steps">
                  <CtaSection id={section.id} data={section.data} />
                </div>
              );
            default: {
              /* Exhaustiveness guard: a new section type won't compile until
                 it is handled above. */
              const _exhaustive: never = section;
              return _exhaustive;
            }
          }
        })}
      </main>

      <footer className="border-t bg-background px-6 py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>
            Prepared by Practice by Numbers for {practiceName}.
          </p>
          <p>Confidential &mdash; intended for the named recipient.</p>
        </div>
      </footer>
    </>
  );
}
