import { formatPrice } from "@/core/domain/money";
import { cn } from "./cn";

export function Price({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  return <span className={cn("font-semibold", className)}>{formatPrice(amount)}</span>;
}
