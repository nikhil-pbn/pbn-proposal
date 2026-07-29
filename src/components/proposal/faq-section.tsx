import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionShell } from "./section-shell";
import type { FaqData } from "@/types/proposal";

export function FaqSection({ id, data }: { id: string; data: FaqData }) {
  return (
    <SectionShell
      id={id}
      tone="muted"
      eyebrow="FAQ"
      heading={data.heading}
      intro={data.intro}
    >
      <Accordion
        type="single"
        collapsible
        defaultValue={data.items[0]?.id}
        className="rounded-xl border bg-card px-5"
      >
        {data.items.map((item) => (
          <AccordionItem key={item.id} value={item.id} className="last:border-b-0">
            <AccordionTrigger className="text-left text-base font-medium">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="max-w-2xl leading-relaxed text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionShell>
  );
}
