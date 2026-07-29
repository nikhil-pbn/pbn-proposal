import { SectionShell } from "./section-shell";
import type { CallSummaryData } from "@/types/proposal";

export function CallSummarySection({
  id,
  data,
}: {
  id: string;
  data: CallSummaryData;
}) {
  return (
    <SectionShell
      id={id}
      eyebrow="For the record"
      heading={data.heading}
      intro={data.intro}
    >
      <div className="rounded-xl border bg-card p-6 shadow-xs sm:p-8">
        {data.meta.length > 0 && (
          <dl className="mb-6 grid gap-4 border-b pb-6 sm:grid-cols-2">
            {data.meta.map((entry) => (
              <div key={entry.id}>
                <dt className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  {entry.label}
                </dt>
                <dd className="mt-1 text-foreground">{entry.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <ul className="space-y-3">
          {data.points.map((point, index) => (
            <li key={index} className="flex gap-3 leading-relaxed">
              <span
                aria-hidden
                className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-accent"
              />
              <span className="text-muted-foreground">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
