import { SectionShell } from "./section-shell";
import type { SummaryData } from "@/types/proposal";

export function SummarySection({ id, data }: { id: string; data: SummaryData }) {
  return (
    <SectionShell id={id} eyebrow="Overview" heading={data.heading}>
      <div className="max-w-3xl space-y-5 text-lg leading-relaxed text-muted-foreground">
        {data.paragraphs.map((paragraph, index) => (
          <p key={index} className={index === 0 ? "text-foreground" : undefined}>
            {paragraph}
          </p>
        ))}
      </div>
    </SectionShell>
  );
}
