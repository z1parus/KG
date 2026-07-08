import { describe, expect, it } from "vitest";
import type { OrderDraft, OrderItem } from "./order";
import { validateDraft } from "./order-validation";
import type { Restaurant } from "./restaurant";

const restaurant: Restaurant = {
  id: "r1",
  name: "Тест",
  phone: "",
  isOpen: true,
  workingHours: { from: "10:00", to: "22:00" },
  deliveryZones: [
    { name: "Центр", minOrder: 500, deliveryFee: 150, estimatedTime: 45 },
  ],
  pickupEnabled: true,
  currency: "RUB",
  address: "",
};

function item(lineTotal: number): OrderItem {
  return {
    dishId: "d",
    name: "d",
    unitPrice: lineTotal,
    qty: 1,
    selectedOptions: [],
    lineTotal,
  };
}

const baseDelivery: OrderDraft = {
  items: [],
  fulfillment: "delivery",
  deliveryZoneName: "Центр",
  address: { street: "Ленина", house: "1" },
  customer: { name: "Иван", phone: "+7 900 123 45 67" },
  paymentMethod: "cash",
};

describe("validateDraft", () => {
  it("passes a valid delivery order above the minimum", () => {
    expect(validateDraft(baseDelivery, [item(600)], restaurant)).toEqual([]);
  });

  it("flags an order below the zone minimum", () => {
    const errors = validateDraft(baseDelivery, [item(300)], restaurant);
    expect(errors.some((e) => e.includes("Минимальная сумма"))).toBe(true);
  });

  it("requires an address for delivery", () => {
    const draft = { ...baseDelivery, address: { street: "", house: "" } };
    const errors = validateDraft(draft, [item(600)], restaurant);
    expect(errors.some((e) => e.includes("адрес"))).toBe(true);
  });

  it("rejects an invalid phone", () => {
    const draft = { ...baseDelivery, customer: { name: "Иван", phone: "123" } };
    const errors = validateDraft(draft, [item(600)], restaurant);
    expect(errors.some((e) => e.includes("телефон"))).toBe(true);
  });

  it("does not require an address for pickup", () => {
    const draft: OrderDraft = {
      ...baseDelivery,
      fulfillment: "pickup",
      deliveryZoneName: undefined,
      address: undefined,
    };
    expect(validateDraft(draft, [item(100)], restaurant)).toEqual([]);
  });

  it("blocks ordering when the restaurant is closed", () => {
    const errors = validateDraft(
      baseDelivery,
      [item(600)],
      { ...restaurant, isOpen: false },
    );
    expect(errors.some((e) => e.includes("закрыт"))).toBe(true);
  });
});
