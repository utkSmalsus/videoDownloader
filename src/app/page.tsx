import Link from "next/link";
import { ChevronDown, ShieldCheck, Zap, Layers, ListVideo, ArrowRight } from "lucide-react";
import { DownloaderShell } from "@/components/downloader/downloader-shell";
import { AmbientBackground } from "@/components/visual/ambient-background";
import { FloatingMedia } from "@/components/visual/floating-media";
import { SectionReveal } from "@/components/visual/section-reveal";
import { PlatformSelector } from "@/components/marketing/platform-selector";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { Footer } from "@/components/marketing/footer";
import { PLATFORM_LIST } from "@/lib/config/platforms";
import { PLATFORM_ICONS } from "@/components/icons/platform-icon";

const STEPS = [
  { n: "01", title: "Paste your link", body: "Drop in a URL from YouTube, Instagram, X, or Facebook." },
  { n: "02", title: "We resolve it", body: "Our server validates it and hands it to a compliant provider." },
  { n: "03", title: "Pick a format", body: "Choose from whatever qualities are actually available — never invented." },
  { n: "04", title: "Download", body: "The file goes straight from the source to your device." },
];

/** Only claims the product can actually back up — no user counts, ratings or logos. */
const FEATURES = [
  { icon: Zap, title: "Fast by design", body: "Server-rendered pages and a minimal client bundle keep it quick." },
  { icon: ShieldCheck, title: "Nothing stored", body: "We resolve links and hand you the file. History stays in your browser." },
  { icon: Layers, title: "One consistent result", body: "Every platform's response is normalized before it reaches the UI." },
  { icon: ListVideo, title: "Whole courses", body: "Queue an entire YouTube playlist and download it lesson by lesson." },
];

const FAQ = [
  {
    q: "Which platforms are supported?",
    a: "YouTube, Instagram, X, and Facebook today. More can be added behind the same provider abstraction.",
  },
  {
    q: "Do you store the media I download?",
    a: "No. We resolve the link and hand you provider-supplied download URLs — nothing is stored on our servers.",
  },
  {
    q: "How do course downloads work?",
    a: "Paste a YouTube playlist URL. We read the lesson list through the official YouTube Data API, then download each selected lesson one at a time. If one fails, the rest keep going.",
  },
  {
    q: "Is this affiliated with YouTube, Instagram, X, or Facebook?",
    a: "No. We're an independent tool. Platform names and trademarks belong to their respective owners.",
  },
  {
    q: "Am I allowed to download this content?",
    a: "You're responsible for making sure you have the right or permission to download and use any media you process.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ---------------------------------------------------------------- *
       * Hero — the downloader is the hero. Copy is short, the input sits
       * above the fold on every screen, and everything moving behind it is
       * decoration that can't intercept a click.
       * ---------------------------------------------------------------- */}
      <section id="top" className="relative isolate scroll-mt-8 overflow-hidden px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:px-8">
        <AmbientBackground variant="hero" grid />
        <FloatingMedia />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md">
            <span className="relative flex size-1.5" aria-hidden>
              <span className="absolute inline-flex size-full animate-[var(--animate-pulse-soft)] rounded-full bg-primary" />
            </span>
            Four platforms. One paste.
          </span>

          <h1 className="mt-6 text-hero font-semibold text-balance">
            Download anything.
            <br />
            <span className="text-gradient">From everywhere.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Paste a video, reel, post or playlist link. Fetchpoint resolves it and hands you the real formats —
            nothing invented, nothing stored.
          </p>
        </div>

        <div className="relative mx-auto mt-10 max-w-2xl">
          <DownloaderShell placeholder="Paste a video, reel, post or course URL" size="hero" />
        </div>

        {/* Platform pills double as navigation — the fastest route to a dedicated page. */}
        <div className="relative mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-2">
          {PLATFORM_LIST.map((p) => {
            const Icon = PLATFORM_ICONS[p.id];
            return (
              <Link
                key={p.id}
                href={`/${p.path}`}
                data-platform={p.id}
                className="platform-transition group inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3.5 py-2 text-sm font-medium text-muted-foreground backdrop-blur-md hover:border-platform-primary/40 hover:bg-platform-soft hover:text-platform-primary"
              >
                <Icon className="size-3.5 transition-transform duration-200 group-hover:scale-110" aria-hidden />
                {p.name}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------------- *
       * Product showcase — show the thing, don't just describe it.
       * ---------------------------------------------------------------- */}
      <section className="relative px-6 py-20 lg:px-8">
        <SectionReveal className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-section font-semibold text-balance">Everything you download. One place.</h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-muted-foreground">
            Same interface for every platform — resolve, pick a quality, download. Courses queue themselves.
          </p>
        </SectionReveal>
        <ProductShowcase />
      </section>

      {/* ---------------------------------------------------------------- *
       * Platforms
       * ---------------------------------------------------------------- */}
      <section className="relative px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <SectionReveal className="mb-10 text-center">
            <h2 className="text-section font-semibold text-balance">A page built for each platform</h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] text-muted-foreground">
              Same reliable pipeline underneath — tuned presentation on top.
            </p>
          </SectionReveal>
          <SectionReveal delay={0.06}>
            <PlatformSelector />
          </SectionReveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- *
       * How it works — numbered, no cards. Whitespace does the grouping.
       * ---------------------------------------------------------------- */}
      <section className="relative border-y border-border bg-surface-sunken/50 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionReveal className="mb-12 text-center">
            <h2 className="text-section font-semibold">How it works</h2>
          </SectionReveal>
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <SectionReveal key={step.n} delay={i * 0.07}>
                <div className="relative">
                  <span className="font-mono text-xs font-medium tracking-widest text-primary">{step.n}</span>
                  <h3 className="mt-3 text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- *
       * Features
       * ---------------------------------------------------------------- */}
      <section className="relative px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionReveal className="mb-12 text-center">
            <h2 className="text-section font-semibold">Built to stay out of the way</h2>
          </SectionReveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <SectionReveal key={title} delay={i * 0.06}>
                <div className="group flex h-full items-start gap-4 rounded-[var(--radius-lg)] border border-border bg-surface/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-border-strong hover:shadow-[var(--shadow-md)]">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary transition-transform duration-300 group-hover:scale-105">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- *
       * FAQ
       * ---------------------------------------------------------------- */}
      <section className="relative px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <SectionReveal className="mb-8 text-center">
            <h2 className="text-section font-semibold">Frequently asked</h2>
          </SectionReveal>
          <SectionReveal delay={0.06}>
            <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface/60 backdrop-blur-sm">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-foreground">
                    {q}
                    <ChevronDown
                      className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{a}</p>
                </details>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- *
       * Closing CTA — scrolls back to the one thing that matters.
       * ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden px-6 pb-24 lg:px-8">
        <SectionReveal className="relative mx-auto max-w-3xl">
          <div className="relative isolate overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface/70 px-8 py-14 text-center backdrop-blur-xl">
            <AmbientBackground variant="page" />
            <div className="relative">
              <h2 className="text-section font-semibold text-balance">Ready when you are.</h2>
              <p className="mx-auto mt-3 max-w-sm text-[15px] text-muted-foreground">
                Paste a link and get your media in a few seconds.
              </p>
              <Link
                href="#top"
                className="group mt-7 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-all duration-200 hover:-translate-y-px hover:brightness-[1.06] focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              >
                Start downloading
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </div>
        </SectionReveal>
      </section>

      <Footer />
    </div>
  );
}
