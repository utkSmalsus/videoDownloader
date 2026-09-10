import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-12 w-full rounded-[var(--radius-md)] border bg-surface px-4 text-sm text-foreground",
        "placeholder:text-muted-foreground transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
        invalid ? "border-danger" : "border-border hover:border-border-strong focus:border-border-strong",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
