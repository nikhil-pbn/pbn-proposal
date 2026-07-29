import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SectionShell } from "./section-shell";
import { cn } from "@/lib/utils";
import type { PricingData } from "@/types/proposal";

export function PricingSection({
  id,
  data,
}: {
  id: string;
  data: PricingData;
}) {
  return (
    <SectionShell
      id={id}
      eyebrow="Pricing"
      heading={data.heading}
      intro={data.intro}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data.plans.map((plan) => (
          <article
            key={plan.id}
            className={cn(
              "flex flex-col rounded-xl border bg-card p-6",
              plan.recommended
                ? "border-brand ring-1 ring-brand shadow-md"
                : "shadow-xs",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-foreground">{plan.name}</h3>
              {plan.recommended && (
                <Badge className="bg-brand text-brand-foreground hover:bg-brand">
                  Recommended
                </Badge>
              )}
            </div>

            <p className="mt-4 text-3xl font-semibold tracking-tight text-brand">
              {plan.price}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{plan.period}</p>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {plan.description}
            </p>

            {plan.features.length > 0 && (
              <ul className="mt-5 space-y-2.5 border-t pt-5 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex gap-2">
                    <Check
                      className="mt-0.5 size-3.5 shrink-0 text-brand-success"
                      aria-hidden
                    />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      {data.addOns.length > 0 && (
        <div className="mt-10">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Available add-ons
          </h3>
          <ul className="mt-4 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {data.addOns.map((addOn) => (
              <li key={addOn.id} className="bg-card px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-foreground">
                    {addOn.name}
                  </span>
                  <span className="text-sm whitespace-nowrap text-brand-accent">
                    {addOn.price}
                  </span>
                </div>
                {addOn.note && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {addOn.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.footnote && (
        <>
          <Separator className="my-8" />
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {data.footnote}
          </p>
        </>
      )}
    </SectionShell>
  );
}
