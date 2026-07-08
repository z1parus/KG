import { describe, expect, it } from "vitest";
import type { Dish } from "./dish";
import { computePricing, resolveOrderItems } from "./order-pricing";
import type { Promocode } from "./promocode";

const dish: Dish = {
  id: "pizza",
  name: "Пицца",
  description: "",
  composition: "",
  categoryId: "pizza",
  price: 450,
  weight: "",
  imageUrl: "",
  available: true,
  popular: false,
  options: [
    {
      id: "size",
      title: "Размер",
      required: true,
      multiple: false,
      choices: [
        { id: "s25", title: "25", priceDelta: 0 },
        { id: "s30", title: "30", priceDelta: 150 },
      ],
    },
  ],
  allergens: [],
};

const unavailable: Dish = { ...dish, id: "gone", name: "Нет", available: false };

const percent10: Promocode = {
  code: "W10",
  type: "percent",
  value: 10,
  minOrder: 500,
  active: true,
};

describe("resolveOrderItems", () => {
  it("recomputes price from the menu, ignoring client input", () => {
    const { items, errors } = resolveOrderItems(
      [{ dishId: "pizza", qty: 2, selectedOptions: [{ optionId: "size", choiceIds: ["s30"] }] }],
      [dish],
    );
    expect(errors).toHaveLength(0);
    expect(items[0].unitPrice).toBe(600);
    expect(items[0].lineTotal).toBe(1200);
  });

  it("rejects unavailable and unknown dishes", () => {
    const { items, errors } = resolveOrderItems(
      [
        { dishId: "gone", qty: 1, selectedOptions: [] },
        { dishId: "ghost", qty: 1, selectedOptions: [] },
      ],
      [dish, unavailable],
    );
    expect(items).toHaveLength(0);
    expect(errors).toHaveLength(2);
  });
});

describe("computePricing", () => {
  it("adds delivery fee and subtracts percent discount above threshold", () => {
    const pricing = computePricing(
      [{ unitPrice: 600, qty: 1 }],
      150,
      percent10,
    );
    expect(pricing.subtotal).toBe(600);
    expect(pricing.discount).toBe(60);
    expect(pricing.deliveryFee).toBe(150);
    expect(pricing.total).toBe(600 - 60 + 150);
  });

  it("does not apply a promocode below its minimum order", () => {
    const pricing = computePricing([{ unitPrice: 300, qty: 1 }], 0, percent10);
    expect(pricing.discount).toBe(0);
    expect(pricing.total).toBe(300);
  });

  it("ignores a promocode when none is given", () => {
    const pricing = computePricing([{ unitPrice: 300, qty: 2 }], 0, null);
    expect(pricing.total).toBe(600);
  });
});
