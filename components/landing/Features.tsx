import { CheckCircle2, Images, Sparkles, Palette } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-driven design",
    desc: "Let AI pick optimal layout, text balance, and visual hierarchy.",
  },
  {
    icon: Images,
    title: "Preset styles",
    desc: "Choose from proven templates optimized for CTR.",
  },
  {
    icon: Palette,
    title: "Brand control",
    desc: "Lock in colors and fonts to stay on-brand.",
  },
  {
    icon: CheckCircle2,
    title: "Bulk export",
    desc: "Generate variations and export in one click.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <h2 className="text-balance text-center text-2xl font-semibold md:text-3xl">
        Everything you need to ship faster
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-foreground/70">
        From idea to thumbnail in seconds. Consistent, on-brand, and optimized
        for engagement.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="rounded-lg border bg-background p-4">
            <f.icon className="h-5 w-5 text-primary" aria-hidden />
            <h3 className="mt-3 text-sm font-medium">{f.title}</h3>
            <p className="mt-1 text-sm text-foreground/70">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
