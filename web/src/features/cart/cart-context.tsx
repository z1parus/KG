"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import {
  addItem,
  cartCount,
  cartSubtotal,
  emptyCart,
  removeItem,
  setQty,
  type Cart,
  type CartItem,
} from "@/core/domain/cart";

type Action =
  | { type: "add"; item: CartItem }
  | { type: "setQty"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "clear" }
  | { type: "hydrate"; cart: Cart };

function reducer(cart: Cart, action: Action): Cart {
  switch (action.type) {
    case "add":
      return addItem(cart, action.item);
    case "setQty":
      return setQty(cart, action.id, action.qty);
    case "remove":
      return removeItem(cart, action.id);
    case "clear":
      return emptyCart;
    case "hydrate":
      return action.cart;
  }
}

interface CartContextValue {
  cart: Cart;
  count: number;
  subtotal: number;
  add: (item: CartItem) => void;
  setItemQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "kg.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(reducer, emptyCart);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        dispatch({ type: "hydrate", cart: JSON.parse(raw) as Cart });
      }
    } catch {
      // повреждённый кэш игнорируем
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // недоступный localStorage игнорируем
    }
  }, [cart]);

  const value: CartContextValue = {
    cart,
    count: cartCount(cart),
    subtotal: cartSubtotal(cart),
    add: (item) => dispatch({ type: "add", item }),
    setItemQty: (id, qty) => dispatch({ type: "setQty", id, qty }),
    remove: (id) => dispatch({ type: "remove", id }),
    clear: () => dispatch({ type: "clear" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
