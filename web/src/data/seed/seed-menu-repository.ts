import type { Category } from "@/core/domain/category";
import type { Dish } from "@/core/domain/dish";
import type { MenuRepository } from "@/core/domain/repositories/menu-repository";
import { seedCategories, seedDishes } from "./seed-data";

export class SeedMenuRepository implements MenuRepository {
  async getCategories(): Promise<Category[]> {
    return seedCategories
      .filter((c) => !c.hidden)
      .sort((a, b) => a.order - b.order);
  }

  async getDishes(): Promise<Dish[]> {
    return seedDishes;
  }

  async getDishesByCategory(categoryId: string): Promise<Dish[]> {
    return seedDishes.filter((d) => d.categoryId === categoryId);
  }

  async getDish(id: string): Promise<Dish | null> {
    return seedDishes.find((d) => d.id === id) ?? null;
  }

  async getPopular(): Promise<Dish[]> {
    return seedDishes.filter((d) => d.popular && d.available);
  }

  async searchDishes(query: string): Promise<Dish[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return seedDishes.filter((d) =>
      d.name.toLowerCase().includes(normalized),
    );
  }
}
