import type { Dish } from "./dish";

export interface SelectedOption {
  optionId: string;
  choiceIds: string[];
}

export interface CartItem {
  id: string;
  dishId: string;
  name: string;
  unitPrice: number;
  qty: number;
  selectedOptions: SelectedOption[];
  imageUrl: string;
}

export interface Cart {
  items: CartItem[];
}

export const emptyCart: Cart = { items: [] };

export function optionsSignature(selected: SelectedOption[]): string {
  return selected
    .filter((o) => o.choiceIds.length > 0)
    .map((o) => `${o.optionId}:${[...o.choiceIds].sort().join(",")}`)
    .sort()
    .join("|");
}

export function unitPriceFor(dish: Dish, selected: SelectedOption[]): number {
  let price = dish.price;
  for (const sel of selected) {
    const option = dish.options.find((o) => o.id === sel.optionId);
    if (!option) continue;
    for (const choiceId of sel.choiceIds) {
      const choice = option.choices.find((c) => c.id === choiceId);
      if (choice) price += choice.priceDelta;
    }
  }
  return price;
}

export function buildCartItem(
  dish: Dish,
  selected: SelectedOption[],
  qty: number,
): CartItem {
  const signature = optionsSignature(selected);
  return {
    id: signature ? `${dish.id}#${signature}` : dish.id,
    dishId: dish.id,
    name: dish.name,
    unitPrice: unitPriceFor(dish, selected),
    qty,
    selectedOptions: selected,
    imageUrl: dish.imageUrl,
  };
}

export function lineTotal(item: CartItem): number {
  return item.unitPrice * item.qty;
}

export function cartSubtotal(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function cartCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.qty, 0);
}

export function addItem(cart: Cart, item: CartItem): Cart {
  const existing = cart.items.find((i) => i.id === item.id);
  if (existing) {
    return {
      items: cart.items.map((i) =>
        i.id === item.id ? { ...i, qty: i.qty + item.qty } : i,
      ),
    };
  }
  return { items: [...cart.items, item] };
}

export function setQty(cart: Cart, itemId: string, qty: number): Cart {
  if (qty <= 0) return removeItem(cart, itemId);
  return {
    items: cart.items.map((i) => (i.id === itemId ? { ...i, qty } : i)),
  };
}

export function removeItem(cart: Cart, itemId: string): Cart {
  return { items: cart.items.filter((i) => i.id !== itemId) };
}
