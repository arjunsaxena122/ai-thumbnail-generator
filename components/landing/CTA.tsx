import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="rounded-lg border bg-background p-6 text-center shadow-sm md:p-10">
        <h3 className="text-pretty text-xl font-semibold md:text-2xl">Ready to level up your thumbnails?</h3>
        <p className="mx-auto mt-2 max-w-2xl text-foreground/70">
          Join thousands of creators increasing CTR with AI-crafted designs.
        </p>
        <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="/signup">
            <Button variant="default">Get started free</Button>
          </a>
          <a href="#pricing">
            <Button variant="outline">View pricing</Button>
          </a>
        </div>
      </div>
    </section>
  )
}
