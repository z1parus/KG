import type { DocumentData } from "firebase/firestore";
import type { Category } from "@/core/domain/category";
import type { Dish, DishOption } from "@/core/domain/dish";
import type { Order, OrderItem, OrderPricing } from "@/core/domain/order";
import type { Promocode } from "@/core/domain/promocode";
import type { Restaurant } from "@/core/domain/restaurant";

export function toCategory(id: string, data: DocumentData): Category {
  return {
    id,
    name: data.name ?? "",
    order: data.order ?? 0,
    hidden: data.hidden ?? false,
    imageUrl: data.imageUrl,
  };
}

export function toDish(id: string, data: DocumentData): Dish {
  return {
    id,
    name: data.name ?? "",
    description: data.description ?? "",
    composition: data.composition ?? "",
    categoryId: data.categoryId ?? "",
    price: data.price ?? 0,
    weight: data.weight ?? "",
    imageUrl: data.imageUrl ?? "",
    available: data.available ?? true,
    popular: data.popular ?? false,
    options: (data.options ?? []) as DishOption[],
    allergens: (data.allergens ?? []) as string[],
  };
}

export function toPromocode(data: DocumentData): Promocode {
  return {
    code: data.code ?? "",
    type: data.type ?? "percent",
    value: data.value ?? 0,
    minOrder: data.minOrder ?? 0,
    active: data.active ?? false,
  };
}

export function toOrder(id: string, data: DocumentData): Order {
  return {
    id,
    number: data.number ?? 0,
    items: (data.items ?? []) as OrderItem[],
    pricing: (data.pricing ?? {
      subtotal: data.subtotal ?? 0,
      deliveryFee: data.deliveryFee ?? 0,
      discount: data.discount ?? 0,
      total: data.total ?? 0,
    }) as OrderPricing,
    fulfillment: data.fulfillment ?? "delivery",
    address: data.deliveryAddress ?? data.address,
    customer: data.customer ?? { name: "", phone: "" },
    scheduledTime: data.scheduledTime ?? null,
    comment: data.comment,
    paymentMethod: data.paymentMethod ?? "cash",
    promocodeId: data.promocodeId,
    status: data.status ?? "new",
    createdAt:
      typeof data.createdAt === "string"
        ? data.createdAt
        : (data.createdAt?.toDate?.().toISOString() ?? new Date().toISOString()),
  };
}

export function toRestaurant(id: string, data: DocumentData): Restaurant {
  return {
    id,
    name: data.name ?? "",
    phone: data.phone ?? "",
    isOpen: data.isOpen ?? false,
    workingHours: data.workingHours ?? { from: "00:00", to: "00:00" },
    deliveryZones: data.deliveryZones ?? [],
    pickupEnabled: data.pickupEnabled ?? false,
    currency: data.currency ?? "RUB",
    address: data.contacts?.address ?? data.address ?? "",
  };
}
