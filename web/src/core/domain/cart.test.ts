import { describe, expect, it } from "vitest";
import {
  addItem,
  buildCartItem,
  cartCount,
  cartSubtotal,
  emptyCart,
  optionsSignature,
  removeItem,
  setQty,
  unitPriceFor,
} from "./cart";
import type { Dish } from "./dish";

const pizza: Dish = {
  id: "pizza",
  name: "Пицца",
  description: "",
  composition: "",
  categoryId: "pizza",
  price: 450,
  weight: "420 г",
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
    {
      id: "extras",
      title: "Добавки",
      required: false,
      multiple: true,
      choices: [
        { id: "cheese", title: "Сыр", priceDelta: 80 },
        { id: "mush", title: "Грибы", priceDelta: 60 },
      ],
    },
  ],
  allergens: [],
};

describe("unitPriceFor", () => {
  it("adds selected option deltas to the base price", () => {
    const price = unitPriceFor(pizza, [
      { optionId: "size", choiceIds: ["s30"] },
      { optionId: "extras", choiceIds: ["cheese", "mush"] },
    ]);
    expect(price).toBe(450 + 150 + 80 + 60);
  });

  it("ignores unknown option and choice ids", () => {
    const price = unitPriceFor(pizza, [
      { optionId: "ghost", choiceIds: ["x"] },
      { optionId: "size", choiceIds: ["nope"] },
    ]);
    expect(price).toBe(450);
  });
});

describe("optionsSignature", () => {
  it("is stable regardless of choice order", () => {
    const a = optionsSignature([{ optionId: "extras", choiceIds: ["cheese", "mush"] }]);
    const b = optionsSignature([{ optionId: "extras", choiceIds: ["mush", "cheese"] }]);
    expect(a).toBe(b);
  });
});

describe("cart operations", () => {
  it("merges identical configurations and sums quantity", () => {
    const item = buildCartItem(pizza, [{ optionId: "size", choiceIds: ["s25"] }], 1);
    const cart = addItem(addItem(emptyCart, item), { ...item });
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].qty).toBe(2);
    expect(cartCount(cart)).toBe(2);
  });

  it("keeps different configurations as separate lines", () => {
    const a = buildCartItem(pizza, [{ optionId: "size", choiceIds: ["s25"] }], 1);
    const b = buildCartItem(pizza, [{ optionId: "size", choiceIds: ["s30"] }], 1);
    const cart = addItem(addItem(emptyCart, a), b);
    expect(cart.items).toHaveLength(2);
    expect(cartSubtotal(cart)).toBe(450 + 600);
  });

  it("removes a line when quantity drops to zero", () => {
    const item = buildCartItem(pizza, [{ optionId: "size", choiceIds: ["s25"] }], 3);
    const cart = setQty(addItem(emptyCart, item), item.id, 0);
    expect(cart.items).toHaveLength(0);
  });

  it("removeItem deletes the matching line", () => {
    const item = buildCartItem(pizza, [{ optionId: "size", choiceIds: ["s25"] }], 1);
    const cart = removeItem(addItem(emptyCart, item), item.id);
    expect(cart.items).toHaveLength(0);
  });
});
