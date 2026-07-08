import type { Restaurant } from "../restaurant";

export interface RestaurantRepository {
  getRestaurant(): Promise<Restaurant>;
  /** Админ: открыть/закрыть приём заказов. */
  setOpen(isOpen: boolean): Promise<Restaurant>;
}
