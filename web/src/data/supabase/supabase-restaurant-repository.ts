import type { Restaurant } from "@/core/domain/restaurant";
import type { RestaurantRepository } from "@/core/domain/repositories/restaurant-repository";
import { getSupabase } from "./supabase-client";
import { rowToRestaurant } from "./mappers";

export class SupabaseRestaurantRepository implements RestaurantRepository {
  async getRestaurant(): Promise<Restaurant> {
    const { data, error } = await getSupabase()
      .from("restaurants")
      .select("*")
      .limit(1)
      .single();
    if (error) throw error;
    return rowToRestaurant(data);
  }

  async setOpen(isOpen: boolean): Promise<Restaurant> {
    const supabase = getSupabase();
    const current = await this.getRestaurant();
    const { data, error } = await supabase
      .from("restaurants")
      .update({ is_open: isOpen })
      .eq("id", current.id)
      .select()
      .single();
    if (error) throw error;
    return rowToRestaurant(data);
  }
}
