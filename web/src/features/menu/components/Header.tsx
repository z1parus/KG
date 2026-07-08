"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/features/cart/cart-context";
import { useRestaurant } from "@/features/menu/hooks/use-restaurant";
import { Container } from "@/ui/Container";

export function Header() {
  const pathname = usePathname();
  const { restaurant } = useRestaurant();
  const { count } = useCart();

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="text-lg font-bold text-brand">
          {restaurant?.name ?? "Меню"}
        </Link>
        <Link
          href="/cart"
          className="relative inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium hover:bg-muted"
        >
          Корзина
          {count > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-semibold text-brand-foreground">
              {count}
            </span>
          )}
        </Link>
      </Container>
    </header>
  );
}
