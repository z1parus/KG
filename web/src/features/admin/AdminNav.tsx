"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/ui/Container";
import { cn } from "@/ui/cn";

const links = [
  { href: "/admin", label: "Сводка" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/menu", label: "Меню" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface">
      <Container className="flex h-14 items-center gap-1">
        <span className="mr-3 font-bold text-brand">Админ-панель</span>
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium",
                active ? "bg-brand text-brand-foreground" : "hover:bg-muted",
              )}
            >
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/"
          className="ml-auto text-sm text-muted-foreground hover:text-brand"
        >
          К витрине →
        </Link>
      </Container>
    </header>
  );
}
