import { TriangleAlert } from "lucide-react";
import { SectionShell } from "./section-shell";
import type { ProblemsData } from "@/types/proposal";

export function ProblemsSection({
  id,
  data,
}: {
  id: string;
  data: ProblemsData;
}) {
  return (
    <SectionShell
      id={id}
      eyebrow="The problem"
      heading={data.heading}
      intro={data.intro}
    >
      <ol className="grid gap-5 sm:grid-cols-2">
        {data.items.map((item, index) => (
          <li
            key={item.id}
            className="relative rounded-xl border bg-card p-6 shadow-xs"
          >
            <span className="text-xs font-semibold tabular-nums text-brand-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 text-lg font-semibold text-foreground">
              {item.title}
            </h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {item.description}
            </p>
            {item.impact && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-md bg-destructive/8 px-2.5 py-1.5 text-sm font-medium text-destructive">
                <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
                {item.impact}
              </p>
            )}
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
