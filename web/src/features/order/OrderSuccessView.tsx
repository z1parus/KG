"use client";

import Link from "next/link";
import {
  orderStatusLabels,
  paymentMethodLabels,
} from "@/core/domain/order";
import { PricingSummary } from "@/features/checkout/PricingSummary";
import { Badge } from "@/ui/Badge";
import { Container } from "@/ui/Container";
import { Price } from "@/ui/Price";
import { Spinner } from "@/ui/Spinner";
import { useOrder } from "./use-order";

export function OrderSuccessView({ id }: { id: string }) {
  const { loading, order } = useOrder(id);

  if (loading) {
    return (
      <Container className="py-16 text-center">
        <Spinner />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="space-y-4 py-16 text-center text-muted-foreground">
        <p>Заказ не найден.</p>
        <Link href="/" className="inline-block font-medium text-brand">
          В меню
        </Link>
      </Container>
    );
  }

  return (
    <Container className="space-y-5 py-6">
      <div className="rounded-2xl border border-border bg-surface p-5 text-center">
        <div className="text-4xl">✅</div>
        <h1 className="mt-2 text-xl font-bold">Заказ №{order.number} оформлен</h1>
        <p className="mt-1 text-muted-foreground">
          {order.fulfillment === "delivery" ? "Доставка" : "Самовывоз"} ·{" "}
          {paymentMethodLabels[order.paymentMethod]}
        </p>
        <div className="mt-3">
          <Badge tone="brand">{orderStatusLabels[order.status]}</Badge>
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">Состав заказа</h2>
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
          {order.items.map((item) => (
            <li
              key={`${item.dishId}-${item.unitPrice}`}
              className="flex items-center justify-between px-4 py-3"
            >
              <span>
                {item.name}
                <span className="text-muted-foreground"> × {item.qty}</span>
              </span>
              <Price amount={item.lineTotal} className="font-normal" />
            </li>
          ))}
        </ul>
      </section>

      <PricingSummary pricing={order.pricing} />

      {order.address && (
        <section className="rounded-xl border border-border bg-surface p-4 text-sm">
          <div className="font-medium">Адрес доставки</div>
          <div className="text-muted-foreground">
            {order.address.street}, {order.address.house}
            {order.address.apt ? `, кв. ${order.address.apt}` : ""}
          </div>
        </section>
      )}

      <Link
        href="/"
        className="block rounded-xl bg-brand py-3 text-center font-medium text-brand-foreground"
      >
        Вернуться в меню
      </Link>
    </Container>
  );
}
