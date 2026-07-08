import type { Category } from "../category";
import type { Dish } from "../dish";

export type DishPatch = Partial<Pick<Dish, "name" | "price" | "available">>;

export interface MenuRepository {
  getCategories(): Promise<Category[]>;
  getDishes(): Promise<Dish[]>;
  getDishesByCategory(categoryId: string): Promise<Dish[]>;
  getDish(id: string): Promise<Dish | null>;
  getPopular(): Promise<Dish[]>;
  searchDishes(query: string): Promise<Dish[]>;
  /** Админ: частичное обновление блюда (наличие/цена/название). */
  updateDish(id: string, patch: DishPatch): Promise<Dish>;
}
