const steps = [
  {
    n: "1",
    title: "Enter your title",
    desc: "Paste a video title or idea. Pick a preset or style.",
  },
  {
    n: "2",
    title: "Generate",
    desc: "AI composes layout, typography, and focal points automatically.",
  },
  {
    n: "3",
    title: "Refine & export",
    desc: "Adjust colors, swap images, and export in 4K or social sizes.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <h2 className="text-balance text-center text-2xl font-semibold md:text-3xl">
        How it works
      </h2>
      <div className="mx-auto mt-6 grid max-w-4xl gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.n}
            className="rounded-lg border border-slate-200 bg-background p-5 dark:border-slate-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {s.n}
            </div>
            <h3 className="mt-3 text-sm font-medium">{s.title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
