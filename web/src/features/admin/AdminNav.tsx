"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { dataSourceName } from "@/lib/repositories";
import { Container } from "@/ui/Container";
import { cn } from "@/ui/cn";

const links = [
  { href: "/admin", label: "Сводка" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/menu", label: "Меню" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  if (pathname === "/admin/login") return null;

  async function handleSignOut() {
    await signOut();
    router.replace("/admin/login");
  }

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
        <div className="ml-auto flex items-center gap-3">
          {dataSourceName === "supabase" && user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm text-muted-foreground hover:text-danger"
            >
              Выйти
            </button>
          )}
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-brand"
          >
            К витрине →
          </Link>
        </div>
      </Container>
    </header>
  );
}
