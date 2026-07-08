import type { Restaurant } from "@/core/domain/restaurant";
import type { RestaurantRepository } from "@/core/domain/repositories/restaurant-repository";
import { seedRestaurant } from "./seed-data";

export class SeedRestaurantRepository implements RestaurantRepository {
  async getRestaurant(): Promise<Restaurant> {
    return seedRestaurant;
  }
}
