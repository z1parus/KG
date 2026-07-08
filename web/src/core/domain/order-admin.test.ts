import { describe, expect, it } from "vitest";
import type { Order } from "./order";
import { nextStatuses } from "./order";
import { computeStats } from "./order-stats";

describe("nextStatuses", () => {
  it("routes a ready delivery through on_the_way", () => {
    expect(nextStatuses("ready", "delivery")).toEqual(["on_the_way", "cancelled"]);
  });

  it("lets a ready pickup be handed out directly", () => {
    expect(nextStatuses("ready", "pickup")).toEqual(["delivered", "cancelled"]);
  });

  it("has no transitions from terminal states", () => {
    expect(nextStatuses("delivered", "delivery")).toEqual([]);
    expect(nextStatuses("cancelled", "pickup")).toEqual([]);
  });
});

function order(total: number, status: Order["status"], createdAt: string): Order {
  return {
    id: Math.random().toString(),
    number: 1,
    items: [],
    pricing: { subtotal: total, deliveryFee: 0, discount: 0, total },
    fulfillment: "delivery",
    customer: { name: "", phone: "" },
    paymentMethod: "cash",
    status,
    createdAt,
  };
}

describe("computeStats", () => {
  it("counts today's non-cancelled orders and averages the check", () => {
    const today = new Date("2026-07-08T12:00:00.000Z");
    const stats = computeStats(
      [
        order(500, "new", "2026-07-08T10:00:00.000Z"),
        order(700, "delivered", "2026-07-08T11:00:00.000Z"),
        order(999, "cancelled", "2026-07-08T09:00:00.000Z"),
        order(400, "new", "2026-07-07T10:00:00.000Z"),
      ],
      today,
    );
    expect(stats.count).toBe(2);
    expect(stats.revenue).toBe(1200);
    expect(stats.averageCheck).toBe(600);
  });
});
