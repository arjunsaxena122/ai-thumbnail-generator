import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    cta: "Start free",
    featured: false,
    features: ["10 generations / mo", "3 presets", "Watermarked export"],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    cta: "Go Pro",
    featured: true,
    features: [
      "Unlimited generations",
      "All presets + custom",
      "Brand kit + bulk export",
    ],
  },
  {
    name: "Team",
    price: "$49",
    period: "/mo",
    cta: "Start Team",
    featured: false,
    features: ["3 seats included", "Shared brand kit", "Priority support"],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <h2 className="text-balance text-center text-2xl font-semibold md:text-3xl">
        Simple, honest pricing
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-foreground/70">
        Start free. Upgrade when you’re ready to scale your content.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={[
              "rounded-lg border bg-background p-6",
              p.featured ? "ring-2 ring-primary" : "",
            ].join(" ")}
          >
            <h3 className="text-sm font-medium">{p.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-semibold">{p.price}</span>
              <span className="text-sm text-foreground/70">{p.period}</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-accent" aria-hidden />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a href="/signup">
              <Button
                className="mt-5 w-full"
                variant={p.featured ? "default" : "outline"}
              >
                {p.cta}
              </Button>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
