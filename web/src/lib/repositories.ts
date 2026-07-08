import type { MenuRepository } from "@/core/domain/repositories/menu-repository";
import type { RestaurantRepository } from "@/core/domain/repositories/restaurant-repository";
import { isFirebaseConfigured } from "@/data/firebase/firebase-client";
import { FirestoreMenuRepository } from "@/data/firebase/firestore-menu-repository";
import { FirestoreRestaurantRepository } from "@/data/firebase/firestore-restaurant-repository";
import { SeedMenuRepository } from "@/data/seed/seed-menu-repository";
import { SeedRestaurantRepository } from "@/data/seed/seed-restaurant-repository";

const useFirebase = isFirebaseConfigured();

export const menuRepository: MenuRepository = useFirebase
  ? new FirestoreMenuRepository()
  : new SeedMenuRepository();

export const restaurantRepository: RestaurantRepository = useFirebase
  ? new FirestoreRestaurantRepository()
  : new SeedRestaurantRepository();

export const dataSourceName = useFirebase ? "firebase" : "seed";
