import { Logo, BRAND_NAME } from "@/components/icons/logo";
import { PLATFORM_LIST } from "@/lib/config/platforms";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-sunken">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <Logo className="size-7" />
            <span className="font-semibold tracking-tight">{BRAND_NAME}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            One link, your media — processed through a compliant provider, normalized into one clean format.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Supported platforms</h4>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            {PLATFORM_LIST.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Product</h4>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <li>History</li>
            <li>Settings</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Legal</h4>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <li>Privacy</li>
            <li>Terms</li>
            <li>Contact</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-6 py-6 lg:px-8">
        <p className="mx-auto max-w-6xl text-xs leading-relaxed text-muted-foreground">
          {BRAND_NAME} is an independent tool and is not affiliated with, endorsed by, or sponsored by YouTube,
          Instagram, X, or Facebook. All platform names and trademarks belong to their respective owners. You are
          solely responsible for ensuring you have the rights or permission to download and use any media you
          process through this service.
        </p>
      </div>
    </footer>
  );
}
