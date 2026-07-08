import type { Restaurant } from "../restaurant";

export interface RestaurantRepository {
  getRestaurant(): Promise<Restaurant>;
}
