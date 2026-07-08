import type { Order } from "./order";

export interface OrderStats {
  count: number;
  revenue: number;
  averageCheck: number;
}

function isSameDay(iso: string, day: Date): boolean {
  const date = new Date(iso);
  return (
    date.getFullYear() === day.getFullYear() &&
    date.getMonth() === day.getMonth() &&
    date.getDate() === day.getDate()
  );
}

/** Статистика по заказам за день (по умолчанию — сегодня). Отменённые не учитываются в выручке. */
export function computeStats(orders: Order[], day: Date = new Date()): OrderStats {
  const todays = orders.filter(
    (o) => o.status !== "cancelled" && isSameDay(o.createdAt, day),
  );
  const revenue = todays.reduce((sum, o) => sum + o.pricing.total, 0);
  const count = todays.length;
  return {
    count,
    revenue,
    averageCheck: count > 0 ? Math.round(revenue / count) : 0,
  };
}
