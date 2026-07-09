"use client";

import { useEffect, useState } from "react";
import { computeStats, type OrderStats } from "@/core/domain/order-stats";
import type { Restaurant } from "@/core/domain/restaurant";
import { orderRepository, restaurantRepository } from "@/lib/repositories";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Price } from "@/ui/Price";
import { Spinner } from "@/ui/Spinner";

export function AdminDashboardView() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      restaurantRepository.getRestaurant(),
      orderRepository.listOrders(),
    ]).then(([r, orders]) => {
      setRestaurant(r);
      setStats(computeStats(orders));
    });
  }, []);

  if (!restaurant || !stats) {
    return (
      <Container className="py-16 text-center">
        <Spinner />
      </Container>
    );
  }

  async function toggleOpen() {
    setBusy(true);
    try {
      const updated = await restaurantRepository.setOpen(!restaurant!.isOpen);
      setRestaurant(updated);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="space-y-5 py-4">
      <section className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
        <div>
          <div className="font-semibold">Приём заказов</div>
          <div className="mt-1">
            <Badge tone={restaurant.isOpen ? "success" : "danger"}>
              {restaurant.isOpen ? "Открыт" : "Закрыт"}
            </Badge>
          </div>
        </div>
        <Button
          variant={restaurant.isOpen ? "secondary" : "primary"}
          disabled={busy}
          onClick={toggleOpen}
        >
          {restaurant.isOpen ? "Закрыть" : "Открыть"}
        </Button>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Сегодня</h2>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Заказы" value={String(stats.count)} />
          <Stat label="Выручка" value={<Price amount={stats.revenue} />} />
          <Stat label="Средний чек" value={<Price amount={stats.averageCheck} />} />
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        Демо-режим: вход без авторизации. Роль <code>admin</code> (claim в
        Supabase) появится при подключении Supabase.
      </p>
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 text-center">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
