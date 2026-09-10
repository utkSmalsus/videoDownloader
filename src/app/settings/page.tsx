import type { Metadata } from "next";
import { Palette, SlidersHorizontal, Lock, Info } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { AmbientBackground } from "@/components/visual/ambient-background";
import { BRAND_NAME } from "@/components/icons/logo";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Palette;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface/70 p-5 backdrop-blur-sm transition-colors duration-300 hover:border-border-strong sm:p-6">
      <div className="flex items-start gap-3.5">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary-soft text-primary">
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div className="relative min-h-full">
      <AmbientBackground variant="page" />
      <div className="relative mx-auto max-w-2xl px-6 pt-14 pb-20 lg:px-8">
        <h1 className="text-section font-semibold tracking-tight">Settings</h1>
        <p className="mt-2.5 text-[15px] text-muted-foreground">Preferences are stored on this device.</p>

        <div className="mt-8 flex flex-col gap-4">
          <Section icon={Palette} title="Appearance" description="Choose how the interface looks.">
            <ThemeToggle />
          </Section>

          <Section
            icon={SlidersHorizontal}
            title="Download preferences"
            description="Pre-selects your usual pick in the results panel."
          >
            <PreferencesForm />
          </Section>

          <Section icon={Lock} title="Privacy">
            <p className="text-sm leading-relaxed text-muted-foreground">
              We don&apos;t store the media you download. Your history is kept only in this browser&apos;s local
              storage and never sent to our servers.
            </p>
          </Section>

          <Section icon={Info} title="About">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {BRAND_NAME} resolves supported social links through a compliant media-processing provider and
              normalizes the response into one consistent format. It is not affiliated with any of the platforms it
              supports.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
