import type { Restaurant } from "@/core/domain/restaurant";
import type { RestaurantRepository } from "@/core/domain/repositories/restaurant-repository";
import { patchRestaurant, readRestaurant } from "./seed-store";

export class SeedRestaurantRepository implements RestaurantRepository {
  async getRestaurant(): Promise<Restaurant> {
    return readRestaurant();
  }

  async setOpen(isOpen: boolean): Promise<Restaurant> {
    return patchRestaurant({ isOpen });
  }
}
