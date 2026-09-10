import { ChevronDown, ShieldCheck, Zap, Layers } from "lucide-react";
import { DownloaderShell } from "@/components/downloader/downloader-shell";
import { HeroVisual } from "@/components/3d/hero-visual";
import { PlatformSelector } from "@/components/marketing/platform-selector";
import { Footer } from "@/components/marketing/footer";

const STEPS = [
  { n: "01", title: "Paste your link", body: "Drop in a URL from YouTube, Instagram, X, or Facebook." },
  { n: "02", title: "We process it", body: "Our server validates it and hands it to a compliant provider." },
  { n: "03", title: "Choose your format", body: "Pick from whatever qualities and formats are actually available." },
  { n: "04", title: "Download", body: "Grab the file straight to your device." },
];

const FEATURES = [
  { icon: Zap, title: "Fast by design", body: "Server-rendered pages and a minimal client bundle keep it quick." },
  { icon: ShieldCheck, title: "Nothing leaks", body: "Provider keys stay server-side. We never expose credentials to the browser." },
  { icon: Layers, title: "One consistent format", body: "Every platform's response is normalized before it ever reaches the UI." },
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
      <section className="surface-grid relative overflow-hidden px-6 pt-16 pb-14 sm:pt-24 sm:pb-20 lg:px-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-60"
          style={{ background: "radial-gradient(60% 50% at 50% 0%, var(--glow-a), transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
            One link. Your media.
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl lg:text-[3.75rem] lg:leading-[1.03]">
            Download media from the web,{" "}
            <span className="text-gradient">effortlessly.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Paste a link from a supported platform. We validate it, hand it to a compliant processing provider, and
            hand you back clean, ready-to-download formats.
          </p>
        </div>

        {/* The core sits behind the downloader, not above it as a separate decoration — the
            input is what the core is "processing". The wrapper reserves exactly the halo's
            footprint so it never bleeds into the caption below. */}
        <div className="relative mx-auto mt-10 max-w-2xl">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 flex -translate-y-1/2 items-center justify-center">
            <HeroVisual size="inline" />
          </div>
          <div className="relative z-10">
            <DownloaderShell placeholder="Paste a YouTube, Instagram, X or Facebook URL" />
          </div>
        </div>

        <p className="relative z-10 mx-auto mt-10 max-w-2xl text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
          YouTube · Instagram · X · Facebook
        </p>
      </section>

      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">Supported platforms</h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted-foreground">
            Each platform gets its own dedicated downloader page, built on the same reliable pipeline.
          </p>
          <div className="mt-8">
            <PlatformSelector />
          </div>
        </div>
      </section>

      <section className="bg-surface-sunken px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.n}>
                <span className="text-sm font-semibold text-primary">{step.n}</span>
                <h3 className="mt-2 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">Why use Fetchpoint</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
                <span className="inline-flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-sunken px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">Frequently asked</h2>
          <div className="mt-8 flex flex-col divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-surface">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground">
                  {q}
                  <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" aria-hidden />
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-[var(--radius-xl)] border border-border bg-surface p-10 text-center shadow-[var(--shadow-md)]">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ready when you are</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Pick a platform above, paste a link, and get your media in a few seconds.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
