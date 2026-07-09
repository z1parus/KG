import type { Category } from "@/core/domain/category";
import type { Dish } from "@/core/domain/dish";
import type {
  DishPatch,
  MenuRepository,
} from "@/core/domain/repositories/menu-repository";
import { getSupabase } from "./supabase-client";
import { rowToCategory, rowToDish } from "./mappers";

export class SupabaseMenuRepository implements MenuRepository {
  async getCategories(): Promise<Category[]> {
    const { data, error } = await getSupabase()
      .from("categories")
      .select("*")
      .eq("hidden", false)
      .order("order");
    if (error) throw error;
    return (data ?? []).map(rowToCategory);
  }

  async getDishes(): Promise<Dish[]> {
    const { data, error } = await getSupabase().from("menu").select("*");
    if (error) throw error;
    return (data ?? []).map(rowToDish);
  }

  async getDishesByCategory(categoryId: string): Promise<Dish[]> {
    const { data, error } = await getSupabase()
      .from("menu")
      .select("*")
      .eq("category_id", categoryId);
    if (error) throw error;
    return (data ?? []).map(rowToDish);
  }

  async getDish(id: string): Promise<Dish | null> {
    const { data, error } = await getSupabase()
      .from("menu")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToDish(data) : null;
  }

  async getPopular(): Promise<Dish[]> {
    const { data, error } = await getSupabase()
      .from("menu")
      .select("*")
      .eq("popular", true)
      .eq("available", true);
    if (error) throw error;
    return (data ?? []).map(rowToDish);
  }

  async searchDishes(query: string): Promise<Dish[]> {
    const normalized = query.trim();
    if (!normalized) return [];
    const { data, error } = await getSupabase()
      .from("menu")
      .select("*")
      .ilike("name", `%${normalized}%`);
    if (error) throw error;
    return (data ?? []).map(rowToDish);
  }

  async updateDish(id: string, patch: DishPatch): Promise<Dish> {
    const { data, error } = await getSupabase()
      .from("menu")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return rowToDish(data);
  }
}
