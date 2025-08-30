import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section
      id="hero"
      className="mx-auto max-w-6xl px-4 pt-12 pb-10 md:pt-20 md:pb-16"
    >
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-pretty text-3xl font-semibold leading-tight md:text-5xl">
            Generate scroll-stopping thumbnails with AI—instantly.
          </h1>
          <p className="text-pretty text-foreground/70 md:text-lg">
            Turn titles into high-converting thumbnails in seconds. No design
            skills. Just results.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#pricing">
              <Button variant="default" className="w-full sm:w-auto">
                Start free
              </Button>
            </a>
            <a href="#gallery">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-transparent"
              >
                See examples
              </Button>
            </a>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-3 text-sm text-foreground/70 md:flex md:flex-wrap">
            <li>• 1-click presets</li>
            <li>• Smart layouts</li>
            <li>• Brand colors</li>
            <li>• Bulk export</li>
          </ul>
        </div>
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <div className="aspect-video w-full overflow-hidden rounded-md border">
            <img
              src="/ai-thumbnail-generator-interface-preview.png"
              alt="Preview of AI Thumbnail Generator interface"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="mt-3 text-center text-xs text-foreground/60">
            Real-time preview with smart focal points
          </p>
        </div>
      </div>
    </section>
  );
}
