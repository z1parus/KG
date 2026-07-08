import type { DocumentData } from "firebase/firestore";
import type { Category } from "@/core/domain/category";
import type { Dish, DishOption } from "@/core/domain/dish";
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
