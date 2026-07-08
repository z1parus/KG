import type { OrderDraft, OrderItem } from "./order";
import type { DeliveryZone, Restaurant } from "./restaurant";

export function findZone(
  restaurant: Restaurant,
  name: string | undefined,
): DeliveryZone | undefined {
  if (!name) return undefined;
  return restaurant.deliveryZones.find((z) => z.name === name);
}

export function isValidPhone(phone: string): boolean {
  return phone.replace(/\D/g, "").length >= 10;
}

/** Валидация черновика заказа. Возвращает список причин отказа (пустой = всё ок). */
export function validateDraft(
  draft: OrderDraft,
  items: OrderItem[],
  restaurant: Restaurant,
): string[] {
  const errors: string[] = [];
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  if (!restaurant.isOpen) errors.push("Ресторан сейчас закрыт");
  if (items.length === 0) errors.push("Корзина пуста");
  if (!draft.customer.name.trim()) errors.push("Укажите имя");
  if (!isValidPhone(draft.customer.phone)) errors.push("Укажите корректный телефон");

  if (draft.fulfillment === "delivery") {
    const zone = findZone(restaurant, draft.deliveryZoneName);
    if (!zone) {
      errors.push("Выберите зону доставки");
    } else if (subtotal < zone.minOrder) {
      errors.push(
        `Минимальная сумма заказа для зоны «${zone.name}» — ${zone.minOrder} ₽`,
      );
    }
    if (!draft.address?.street?.trim() || !draft.address?.house?.trim()) {
      errors.push("Укажите адрес доставки (улица и дом)");
    }
  } else if (!restaurant.pickupEnabled) {
    errors.push("Самовывоз недоступен");
  }

  return errors;
}
