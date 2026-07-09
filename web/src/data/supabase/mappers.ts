import type { Category } from "@/core/domain/category";
import type { Dish, DishOption } from "@/core/domain/dish";
import type { Order, OrderItem, OrderPricing } from "@/core/domain/order";
import type { Promocode } from "@/core/domain/promocode";
import type { Restaurant } from "@/core/domain/restaurant";

/* Postgres хранит колонки в snake_case — мапперы приводят их к доменным типам. */

type Row = Record<string, unknown>;

export function rowToCategory(row: Row): Category {
  return {
    id: String(row.id),
    name: (row.name as string) ?? "",
    order: (row.order as number) ?? 0,
    hidden: (row.hidden as boolean) ?? false,
    imageUrl: (row.image_url as string) ?? undefined,
  };
}

export function rowToDish(row: Row): Dish {
  return {
    id: String(row.id),
    name: (row.name as string) ?? "",
    description: (row.description as string) ?? "",
    composition: (row.composition as string) ?? "",
    categoryId: (row.category_id as string) ?? "",
    price: (row.price as number) ?? 0,
    weight: (row.weight as string) ?? "",
    imageUrl: (row.image_url as string) ?? "",
    available: (row.available as boolean) ?? true,
    popular: (row.popular as boolean) ?? false,
    options: (row.options as DishOption[]) ?? [],
    allergens: (row.allergens as string[]) ?? [],
  };
}

export function rowToRestaurant(row: Row): Restaurant {
  return {
    id: String(row.id),
    name: (row.name as string) ?? "",
    phone: (row.phone as string) ?? "",
    isOpen: (row.is_open as boolean) ?? false,
    workingHours: (row.working_hours as Restaurant["workingHours"]) ?? {
      from: "00:00",
      to: "00:00",
    },
    deliveryZones: (row.delivery_zones as Restaurant["deliveryZones"]) ?? [],
    pickupEnabled: (row.pickup_enabled as boolean) ?? false,
    currency: (row.currency as Restaurant["currency"]) ?? "RUB",
    address: (row.address as string) ?? "",
  };
}

export function rowToPromocode(row: Row): Promocode {
  return {
    code: (row.code as string) ?? "",
    type: (row.type as Promocode["type"]) ?? "percent",
    value: (row.value as number) ?? 0,
    minOrder: (row.min_order as number) ?? 0,
    active: (row.active as boolean) ?? false,
  };
}

export function rowToOrder(row: Row): Order {
  return {
    id: String(row.id),
    number: (row.number as number) ?? 0,
    items: (row.items as OrderItem[]) ?? [],
    pricing: (row.pricing as OrderPricing) ?? {
      subtotal: 0,
      deliveryFee: 0,
      discount: 0,
      total: 0,
    },
    fulfillment: (row.fulfillment as Order["fulfillment"]) ?? "delivery",
    address: (row.address as Order["address"]) ?? undefined,
    customer: (row.customer as Order["customer"]) ?? { name: "", phone: "" },
    scheduledTime: (row.scheduled_time as string | null) ?? null,
    comment: (row.comment as string) ?? undefined,
    paymentMethod: (row.payment_method as Order["paymentMethod"]) ?? "cash",
    promocodeId: (row.promocode_id as string) ?? undefined,
    status: (row.status as Order["status"]) ?? "new",
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
  };
}
