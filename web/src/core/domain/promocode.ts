export type PromocodeType = "percent" | "fixed";

export interface Promocode {
  code: string;
  type: PromocodeType;
  value: number;
  minOrder: number;
  active: boolean;
}

/** Размер скидки для суммы заказа. 0, если промокод неактивен или не достигнут порог. */
export function discountFor(promocode: Promocode, subtotal: number): number {
  if (!promocode.active || subtotal < promocode.minOrder) return 0;
  const raw =
    promocode.type === "percent"
      ? Math.round((subtotal * promocode.value) / 100)
      : promocode.value;
  return Math.min(raw, subtotal);
}
