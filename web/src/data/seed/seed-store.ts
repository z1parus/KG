import type { Dish } from "@/core/domain/dish";
import type { DishPatch } from "@/core/domain/repositories/menu-repository";
import type { Restaurant } from "@/core/domain/restaurant";
import { seedDishes, seedRestaurant } from "./seed-data";

/*
 * Локальный «стор» для seed-режима: держит правки админки (наличие/цена блюд,
 * режим работы ресторана) в localStorage, поверх дефолтов из seed-data.
 * В реальном режиме эти данные живут в Supabase (Postgres) — здесь только dev-персист.
 */

const DISHES_KEY = "kg.menu.v1";
const RESTAURANT_KEY = "kg.restaurant.v1";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function readDishes(): Dish[] {
  if (!hasWindow()) return seedDishes;
  try {
    const raw = window.localStorage.getItem(DISHES_KEY);
    if (!raw) return seedDishes;
    return JSON.parse(raw) as Dish[];
  } catch {
    return seedDishes;
  }
}

export function updateDish(id: string, patch: DishPatch): Dish {
  const dishes = readDishes();
  const index = dishes.findIndex((d) => d.id === id);
  if (index === -1) {
    throw new Error(`Блюдо не найдено: ${id}`);
  }
  const updated: Dish = { ...dishes[index], ...patch };
  const next = [...dishes];
  next[index] = updated;
  if (hasWindow()) {
    window.localStorage.setItem(DISHES_KEY, JSON.stringify(next));
  }
  return updated;
}

export function readRestaurant(): Restaurant {
  if (!hasWindow()) return seedRestaurant;
  try {
    const raw = window.localStorage.getItem(RESTAURANT_KEY);
    if (!raw) return seedRestaurant;
    return { ...seedRestaurant, ...(JSON.parse(raw) as Partial<Restaurant>) };
  } catch {
    return seedRestaurant;
  }
}

export function patchRestaurant(patch: Partial<Restaurant>): Restaurant {
  const updated: Restaurant = { ...readRestaurant(), ...patch };
  if (hasWindow()) {
    window.localStorage.setItem(RESTAURANT_KEY, JSON.stringify(updated));
  }
  return updated;
}
