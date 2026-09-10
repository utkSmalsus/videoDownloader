import type { Metadata } from "next";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { BRAND_NAME } from "@/components/icons/logo";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">Preferences are stored on this device.</p>

      <div className="mt-8 flex flex-col gap-5">
        <Section title="Appearance" description="Choose how the interface looks.">
          <ThemeToggle />
        </Section>

        <Section title="Download preferences" description="Used to pre-select your usual pick in the results panel.">
          <PreferencesForm />
        </Section>

        <Section title="Privacy">
          <p className="text-sm text-muted-foreground">
            We don&apos;t store the media you download. Your history is kept only in this browser&apos;s local
            storage and never sent to our servers.
          </p>
        </Section>

        <Section title="About">
          <p className="text-sm text-muted-foreground">
            {BRAND_NAME} resolves supported social links through a compliant media-processing provider and
            normalizes the response into one consistent format. It is not affiliated with any of the platforms it
            supports.
          </p>
        </Section>
      </div>
    </div>
  );
}
