import { SectionShell } from "./section-shell";
import type { BenefitsData } from "@/types/proposal";

export function BenefitsSection({
  id,
  data,
}: {
  id: string;
  data: BenefitsData;
}) {
  return (
    <SectionShell
      id={id}
      tone="brand"
      eyebrow="Proof"
      heading={data.heading}
      intro={data.intro}
    >
      {/* Stat tiles: label in sentence case, value semibold with the font's
          default proportional figures (tabular-nums would look loose at this size). */}
      {data.metrics.length > 0 && (
        <dl className="grid gap-px overflow-hidden rounded-xl bg-primary-foreground/15 sm:grid-cols-2 lg:grid-cols-4">
          {data.metrics.map((metric) => (
            <div key={metric.id} className="bg-primary p-6">
              <dd className="text-4xl font-semibold tracking-tight">
                {metric.value}
              </dd>
              <dt className="mt-2 font-medium text-primary-foreground/90">
                {metric.label}
              </dt>
              {metric.caption && (
                <p className="mt-1 text-sm text-primary-foreground/60">
                  {metric.caption}
                </p>
              )}
            </div>
          ))}
        </dl>
      )}

      {data.items.length > 0 && (
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {data.items.map((item) => (
            <div
              key={item.id}
              className="border-l-2 border-brand-accent/60 pl-5"
            >
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1.5 leading-relaxed text-primary-foreground/75">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
