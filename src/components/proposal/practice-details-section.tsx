import { SectionShell } from "./section-shell";
import type { PracticeDetailsData } from "@/types/proposal";

export function PracticeDetailsSection({
  id,
  data,
}: {
  id: string;
  data: PracticeDetailsData;
}) {
  return (
    <SectionShell
      id={id}
      tone="muted"
      eyebrow="Your practice"
      heading={data.heading}
      intro={data.intro}
    >
      <dl className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item) => (
          <div key={item.id} className="bg-card p-5">
            <dt className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-2 text-lg font-medium text-foreground">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </SectionShell>
  );
}
