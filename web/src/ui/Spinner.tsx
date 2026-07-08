import { cn } from "./cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Загрузка"
      className={cn(
        "inline-block h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-brand",
        className,
      )}
    />
  );
}
