"use client";

import Link from "next/link";
import { lineTotal } from "@/core/domain/cart";
import { useCart } from "@/features/cart/cart-context";
import { DishImage } from "@/features/menu/components/DishImage";
import { Button } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Price } from "@/ui/Price";
import { QtyStepper } from "@/ui/QtyStepper";

export function CartView() {
  const { cart, subtotal, setItemQty, remove, clear } = useCart();

  if (cart.items.length === 0) {
    return (
      <Container className="space-y-4 py-16 text-center">
        <p className="text-muted-foreground">Корзина пуста.</p>
        <Link href="/" className="inline-block font-medium text-brand">
          Перейти в меню
        </Link>
      </Container>
    );
  }

  return (
    <Container className="space-y-4 py-4 pb-28">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Корзина</h1>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-muted-foreground hover:text-danger"
        >
          Очистить
        </button>
      </div>

      <ul className="space-y-3">
        {cart.items.map((item) => (
          <li
            key={item.id}
            className="flex gap-3 rounded-xl border border-border bg-surface p-3"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
              <DishImage
                imageUrl={item.imageUrl}
                categoryId=""
                alt={item.name}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold">{item.name}</span>
                <button
                  type="button"
                  aria-label="Удалить"
                  onClick={() => remove(item.id)}
                  className="text-muted-foreground hover:text-danger"
                >
                  ✕
                </button>
              </div>
              <span className="text-sm text-muted-foreground">
                <Price amount={item.unitPrice} /> за шт.
              </span>
              <div className="mt-auto flex items-center justify-between pt-2">
                <QtyStepper
                  value={item.qty}
                  onChange={(qty) => setItemQty(item.id, qty)}
                  min={0}
                />
                <Price amount={lineTotal(item)} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-surface">
        <Container className="flex items-center justify-between py-3">
          <div>
            <div className="text-sm text-muted-foreground">Итого</div>
            <Price amount={subtotal} className="text-lg" />
          </div>
          <Button disabled title="Оформление заказа — Фаза 2">
            Оформить заказ
          </Button>
        </Container>
      </div>
    </Container>
  );
}
