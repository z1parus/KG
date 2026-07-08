import type { Category } from "../category";
import type { Dish } from "../dish";

export interface MenuRepository {
  getCategories(): Promise<Category[]>;
  getDishes(): Promise<Dish[]>;
  getDishesByCategory(categoryId: string): Promise<Dish[]>;
  getDish(id: string): Promise<Dish | null>;
  getPopular(): Promise<Dish[]>;
  searchDishes(query: string): Promise<Dish[]>;
}
