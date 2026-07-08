import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-surface px-4 text-base outline-none placeholder:text-muted-foreground focus:border-brand",
        className,
      )}
      {...props}
    />
  );
}
