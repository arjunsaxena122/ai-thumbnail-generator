"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const nav = [
  { href: "#features", label: "Features" },
  { href: "#gallery", label: "Gallery" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Thumbly AI Home"
        >
          <div className="h-6 w-6 rounded bg-primary" aria-hidden />
          <span className="text-sm font-semibold tracking-tight">
            Thumbly AI
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm text-foreground/70 hover:text-foreground transition-colors"
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="hidden md:block">
            <Button
              variant="ghost"
              className="text-foreground/80 hover:text-foreground"
            >
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="default" className="text-primary-foreground">
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
