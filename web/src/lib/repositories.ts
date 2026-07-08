import type { MenuRepository } from "@/core/domain/repositories/menu-repository";
import type { OrderRepository } from "@/core/domain/repositories/order-repository";
import type { PromocodeRepository } from "@/core/domain/repositories/promocode-repository";
import type { RestaurantRepository } from "@/core/domain/repositories/restaurant-repository";
import { isFirebaseConfigured } from "@/data/firebase/firebase-client";
import { FirestoreMenuRepository } from "@/data/firebase/firestore-menu-repository";
import { FirestoreOrderRepository } from "@/data/firebase/firestore-order-repository";
import { FirestorePromocodeRepository } from "@/data/firebase/firestore-promocode-repository";
import { FirestoreRestaurantRepository } from "@/data/firebase/firestore-restaurant-repository";
import { SeedMenuRepository } from "@/data/seed/seed-menu-repository";
import { SeedOrderRepository } from "@/data/seed/seed-order-repository";
import { SeedPromocodeRepository } from "@/data/seed/seed-promocode-repository";
import { SeedRestaurantRepository } from "@/data/seed/seed-restaurant-repository";

const useFirebase = isFirebaseConfigured();

export const menuRepository: MenuRepository = useFirebase
  ? new FirestoreMenuRepository()
  : new SeedMenuRepository();

export const restaurantRepository: RestaurantRepository = useFirebase
  ? new FirestoreRestaurantRepository()
  : new SeedRestaurantRepository();

export const promocodeRepository: PromocodeRepository = useFirebase
  ? new FirestorePromocodeRepository()
  : new SeedPromocodeRepository();

export const orderRepository: OrderRepository = useFirebase
  ? new FirestoreOrderRepository()
  : new SeedOrderRepository(
      menuRepository,
      restaurantRepository,
      promocodeRepository,
    );

export const dataSourceName = useFirebase ? "firebase" : "seed";
