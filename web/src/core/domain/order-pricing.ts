import { unitPriceFor } from "./cart";
import type { Dish } from "./dish";
import type { OrderDraftItem, OrderItem, OrderPricing } from "./order";
import { discountFor, type Promocode } from "./promocode";

export interface ResolveResult {
  items: OrderItem[];
  errors: string[];
}

/**
 * Пересчитывает позиции заказа по актуальному меню (серверная операция).
 * Цены берутся из меню, а не из клиентского запроса — защита от подмены.
 */
export function resolveOrderItems(
  draftItems: OrderDraftItem[],
  dishes: Dish[],
): ResolveResult {
  const items: OrderItem[] = [];
  const errors: string[] = [];
  for (const draftItem of draftItems) {
    const dish = dishes.find((d) => d.id === draftItem.dishId);
    if (!dish) {
      errors.push(`Блюдо недоступно: ${draftItem.dishId}`);
      continue;
    }
    if (!dish.available) {
      errors.push(`Нет в наличии: ${dish.name}`);
      continue;
    }
    if (draftItem.qty <= 0) {
      errors.push(`Некорректное количество: ${dish.name}`);
      continue;
    }
    const unitPrice = unitPriceFor(dish, draftItem.selectedOptions);
    items.push({
      dishId: dish.id,
      name: dish.name,
      unitPrice,
      qty: draftItem.qty,
      selectedOptions: draftItem.selectedOptions,
      lineTotal: unitPrice * draftItem.qty,
    });
  }
  return { items, errors };
}

export interface PricingInput {
  unitPrice: number;
  qty: number;
  lineTotal?: number;
}

/** Итоговое ценообразование. Источник правды по сумме заказа. */
export function computePricing(
  items: PricingInput[],
  deliveryFee: number,
  promocode: Promocode | null,
): OrderPricing {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.lineTotal ?? item.unitPrice * item.qty),
    0,
  );
  const discount = promocode ? discountFor(promocode, subtotal) : 0;
  const total = Math.max(0, subtotal - discount) + deliveryFee;
  return { subtotal, deliveryFee, discount, total };
}
