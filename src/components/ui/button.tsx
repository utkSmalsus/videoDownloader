import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  // Reads --platform-* tokens, which fall back to the app's own brand color outside any
  // [data-platform] scope — every primary CTA becomes platform-aware for free. The gradient is
  // a real multi-hue sweep for Instagram and a near-imperceptible same-hue sheen everywhere
  // else (see globals.css), so this never looks like a rainbow CTA.
  primary:
    "bg-platform-primary bg-[image:linear-gradient(135deg,var(--platform-gradient-from),var(--platform-gradient-mid),var(--platform-gradient-to))] text-platform-primary-foreground hover:brightness-[1.08] shadow-[0_0_0_1px_var(--platform-primary),0_12px_34px_-10px_var(--platform-glow)] active:scale-[0.98] platform-transition",
  secondary:
    "bg-surface-elevated text-foreground border border-border hover:border-border-strong active:scale-[0.98]",
  ghost: "text-foreground hover:bg-muted active:scale-[0.98]",
  outline: "border border-border text-foreground hover:bg-muted active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-[var(--radius-sm)]",
  md: "h-11 px-5 text-sm gap-2 rounded-[var(--radius-md)]",
  lg: "h-13 px-6 text-base gap-2 rounded-[var(--radius-md)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium whitespace-nowrap transition-all duration-150",
          "disabled:opacity-50 disabled:pointer-events-none",
          "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
