import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="inline-flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="size-5" aria-hidden />
      </span>
      <p className="text-sm font-medium text-foreground">This platform isn&apos;t supported yet.</p>
      <p className="text-sm text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/">
        <Button variant="secondary" size="sm">
          Back home
        </Button>
      </Link>
    </div>
  );
}
