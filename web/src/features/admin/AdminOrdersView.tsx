"use client";

import { useMemo, useState } from "react";
import {
  isActiveStatus,
  nextStatuses,
  orderStatusLabels,
  type Fulfillment,
  type Order,
  type OrderStatus,
} from "@/core/domain/order";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Price } from "@/ui/Price";
import { Spinner } from "@/ui/Spinner";
import { useAdminOrders } from "./use-admin-orders";

function actionLabel(status: OrderStatus, fulfillment: Fulfillment): string {
  if (status === "cancelled") return "Отменить";
  if (status === "delivered") return fulfillment === "pickup" ? "Выдан" : "Доставлен";
  return orderStatusLabels[status];
}

function statusTone(status: OrderStatus) {
  if (status === "cancelled") return "danger" as const;
  if (status === "delivered") return "success" as const;
  return isActiveStatus(status) ? ("brand" as const) : ("neutral" as const);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminOrdersView() {
  const { orders, loading, error, refresh, setStatus } = useAdminOrders();
  const [tab, setTab] = useState<"active" | "all">("active");

  const visible = useMemo(
    () => (tab === "active" ? orders.filter((o) => isActiveStatus(o.status)) : orders),
    [orders, tab],
  );

  if (loading) {
    return (
      <Container className="py-16 text-center">
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(["active", "all"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={
                "rounded-lg px-3 py-1.5 text-sm font-medium " +
                (tab === value ? "bg-brand text-brand-foreground" : "hover:bg-muted")
              }
            >
              {value === "active" ? "Активные" : "Все"}
            </button>
          ))}
        </div>
        <Button variant="secondary" size="sm" onClick={refresh}>
          Обновить
        </Button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {visible.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          {tab === "active" ? "Активных заказов нет." : "Заказов нет."}
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((order) => (
            <OrderRow key={order.id} order={order} onStatus={setStatus} />
          ))}
        </ul>
      )}
    </Container>
  );
}

function OrderRow({
  order,
  onStatus,
}: {
  order: Order;
  onStatus: (id: string, status: OrderStatus) => void;
}) {
  const transitions = nextStatuses(order.status, order.fulfillment);

  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-bold">Заказ №{order.number}</span>
          <span className="ml-2 text-sm text-muted-foreground">
            {formatTime(order.createdAt)}
          </span>
        </div>
        <Badge tone={statusTone(order.status)}>
          {orderStatusLabels[order.status]}
        </Badge>
      </div>

      <div className="mt-1 text-sm text-muted-foreground">
        {order.fulfillment === "delivery" ? "Доставка" : "Самовывоз"} ·{" "}
        {order.customer.name} · {order.customer.phone}
      </div>
      {order.address && (
        <div className="text-sm text-muted-foreground">
          {order.address.street}, {order.address.house}
          {order.address.apt ? `, кв. ${order.address.apt}` : ""}
        </div>
      )}

      <ul className="mt-2 text-sm">
        {order.items.map((item) => (
          <li key={`${item.dishId}-${item.unitPrice}`}>
            {item.name} × {item.qty}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between">
        <Price amount={order.pricing.total} />
        <div className="flex gap-2">
          {transitions.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={status === "cancelled" ? "secondary" : "primary"}
              onClick={() => onStatus(order.id, status)}
            >
              {actionLabel(status, order.fulfillment)}
            </Button>
          ))}
        </div>
      </div>
    </li>
  );
}
