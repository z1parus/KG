import type { OrderPricing } from "@/core/domain/order";
import { Price } from "@/ui/Price";

function Row({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Price amount={amount} className="font-normal" />
    </div>
  );
}

export function PricingSummary({ pricing }: { pricing: OrderPricing }) {
  return (
    <div className="space-y-1.5 rounded-xl border border-border bg-surface p-4">
      <Row label="Сумма" amount={pricing.subtotal} />
      {pricing.deliveryFee > 0 && (
        <Row label="Доставка" amount={pricing.deliveryFee} />
      )}
      {pricing.discount > 0 && (
        <div className="flex items-center justify-between text-sm text-success">
          <span>Скидка</span>
          <span>
            −<Price amount={pricing.discount} className="font-normal" />
          </span>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
        <span>Итого</span>
        <Price amount={pricing.total} />
      </div>
    </div>
  );
}
