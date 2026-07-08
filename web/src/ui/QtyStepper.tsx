"use client";

import { cn } from "./cn";

export function QtyStepper({
  value,
  onChange,
  min = 1,
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-border bg-surface",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Уменьшить"
        className="flex h-9 w-9 items-center justify-center text-lg disabled:opacity-40"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-semibold">{value}</span>
      <button
        type="button"
        aria-label="Увеличить"
        className="flex h-9 w-9 items-center justify-center text-lg"
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
