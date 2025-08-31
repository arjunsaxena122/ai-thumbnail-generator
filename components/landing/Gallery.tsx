const galleryImages = [
  {
    src: "/bold-text-with-face-cutout.png",
    alt: "Sample thumbnail style: Bold text with face cutout",
  },
  {
    src: "/minimal-typographic-thumbnail.png",
    alt: "Sample thumbnail style: Minimal typographic thumbnail",
  },
  {
    src: "/tech-focused-blue-layout.png",
    alt: "Sample thumbnail style: Tech-focused blue layout",
  },
  {
    src: "/creator-lifestyle-scene.png",
    alt: "Sample thumbnail style: Creator lifestyle scene",
  },
  {
    src: "/tutorial-before-after-layout.png",
    alt: "Sample thumbnail style: Tutorial before/after layout",
  },
  {
    src: "/high-contrast-news-style.png",
    alt: "Sample thumbnail style: High-contrast news style",
  },
];

export function Gallery() {
  return (
    <section id="gallery" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-balance text-2xl font-semibold md:text-3xl">
            Gallery
          </h2>
          <p className="mt-2 text-foreground/70">
            Hand-tuned presets designed to convert clicks.
          </p>
        </div>
        <p className="hidden text-sm text-foreground/60 md:block">
          Hover to zoom
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {galleryImages.map((img, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-md border"
          >
            <img
              src={img.src || "/placeholder.svg"}
              alt={img.alt}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
