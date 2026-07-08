import { collection, getDocs, limit, query } from "firebase/firestore";
import type { Restaurant } from "@/core/domain/restaurant";
import type { RestaurantRepository } from "@/core/domain/repositories/restaurant-repository";
import { getDb } from "./firebase-client";
import { toRestaurant } from "./mappers";

export class FirestoreRestaurantRepository implements RestaurantRepository {
  async getRestaurant(): Promise<Restaurant> {
    const db = getDb();
    const snapshot = await getDocs(
      query(collection(db, "restaurants"), limit(1)),
    );
    const first = snapshot.docs[0];
    if (!first) {
      throw new Error("No restaurant document found in Firestore.");
    }
    return toRestaurant(first.id, first.data());
  }
}
