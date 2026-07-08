"use client";

import { cn } from "@/ui/cn";

export function MenuSearch({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <input
      type="search"
      inputMode="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Поиск по меню…"
      aria-label="Поиск по меню"
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-surface px-4 text-base outline-none placeholder:text-muted-foreground focus:border-brand",
        className,
      )}
    />
  );
}
