import { AlertTriangle, WifiOff, Clock3, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaErrorCode } from "@/types/media";

const ICONS: Record<MediaErrorCode | "invalid_url", typeof AlertTriangle> = {
  invalid_url: AlertTriangle,
  unsupported_platform: AlertTriangle,
  provider_error: ServerCrash,
  rate_limited: Clock3,
  network_error: WifiOff,
  not_configured: ServerCrash,
};

export function ErrorState({
  code,
  message,
  onRetry,
}: {
  code: MediaErrorCode | "invalid_url";
  message: string;
  onRetry: () => void;
}) {
  const Icon = ICONS[code];
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface px-6 py-10 text-center"
    >
      <span className="inline-flex size-11 items-center justify-center rounded-full bg-danger-soft text-danger">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="max-w-xs text-sm font-medium text-foreground">{message}</p>
      <Button variant="ghost" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
