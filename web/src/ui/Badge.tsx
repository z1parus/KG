import type { ReactNode } from "react";
import { cn } from "./cn";

type Tone = "neutral" | "brand" | "danger" | "success";

const tones: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  brand: "bg-brand text-brand-foreground",
  danger: "bg-danger text-white",
  success: "bg-success text-white",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
