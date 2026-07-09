"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Container } from "@/ui/Container";
import { Spinner } from "@/ui/Spinner";
import { useAuth } from "./auth-context";

/** Пускает в админку только пользователя с ролью admin. Страница входа — исключение. */
export function AdminGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && !isLoginRoute && !user?.isAdmin) {
      router.replace("/admin/login");
    }
  }, [loading, isLoginRoute, user, router]);

  if (isLoginRoute) return <>{children}</>;

  if (loading || !user?.isAdmin) {
    return (
      <Container className="py-16 text-center">
        <Spinner />
      </Container>
    );
  }

  return <>{children}</>;
}
