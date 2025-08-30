import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-primary" aria-hidden />
            <span className="text-sm font-semibold">Thumbly AI</span>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-foreground/70">
            <a href="#features">Features</a>
            <a href="#gallery">Gallery</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign up</Link>
          </nav>
        </div>
        <p className="mt-6 text-xs text-foreground/60">
          © {new Date().getFullYear()} Thumbly AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
