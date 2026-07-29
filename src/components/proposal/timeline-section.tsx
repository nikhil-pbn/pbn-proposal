import { SectionShell } from "./section-shell";
import type { TimelineData } from "@/types/proposal";

export function TimelineSection({
  id,
  data,
}: {
  id: string;
  data: TimelineData;
}) {
  return (
    <SectionShell
      id={id}
      tone="muted"
      eyebrow="Implementation"
      heading={data.heading}
      intro={data.intro}
    >
      <ol className="relative space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-border">
        {data.phases.map((phase) => (
          <li key={phase.id} className="relative pl-8">
            <span
              aria-hidden
              className="absolute top-1.5 left-0 size-[15px] rounded-full border-2 border-brand bg-background"
            />
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-accent">
              {phase.label}
            </p>
            <h3 className="mt-1.5 text-lg font-semibold text-foreground">
              {phase.title}
            </h3>
            <p className="mt-1.5 max-w-2xl leading-relaxed text-muted-foreground">
              {phase.description}
            </p>
            {phase.items.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {phase.items.map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span aria-hidden className="text-border select-none">
                      &mdash;
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
