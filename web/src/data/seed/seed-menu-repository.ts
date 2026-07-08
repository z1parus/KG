import type { Category } from "@/core/domain/category";
import type { Dish } from "@/core/domain/dish";
import type {
  DishPatch,
  MenuRepository,
} from "@/core/domain/repositories/menu-repository";
import { seedCategories } from "./seed-data";
import { readDishes, updateDish } from "./seed-store";

export class SeedMenuRepository implements MenuRepository {
  async getCategories(): Promise<Category[]> {
    return seedCategories
      .filter((c) => !c.hidden)
      .sort((a, b) => a.order - b.order);
  }

  async getDishes(): Promise<Dish[]> {
    return readDishes();
  }

  async getDishesByCategory(categoryId: string): Promise<Dish[]> {
    return readDishes().filter((d) => d.categoryId === categoryId);
  }

  async getDish(id: string): Promise<Dish | null> {
    return readDishes().find((d) => d.id === id) ?? null;
  }

  async getPopular(): Promise<Dish[]> {
    return readDishes().filter((d) => d.popular && d.available);
  }

  async searchDishes(query: string): Promise<Dish[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return readDishes().filter((d) =>
      d.name.toLowerCase().includes(normalized),
    );
  }

  async updateDish(id: string, patch: DishPatch): Promise<Dish> {
    return updateDish(id, patch);
  }
}
