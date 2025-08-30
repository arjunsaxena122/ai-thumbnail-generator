import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Can I use my own fonts and colors?",
    a: "Yes. Upload brand colors and fonts to keep every thumbnail on-brand.",
  },
  {
    q: "Do you support bulk generation?",
    a: "Pro and Team plans support generating multiple variations and bulk exporting.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes, the Free plan includes 10 generations per month with watermarked exports.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h2 className="text-balance text-center text-2xl font-semibold md:text-3xl">
        Frequently asked questions
      </h2>
      <Accordion type="single" collapsible className="mt-6">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="text-foreground/70">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
