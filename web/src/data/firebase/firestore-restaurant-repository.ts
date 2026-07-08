import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  updateDoc,
} from "firebase/firestore";
import type { Restaurant } from "@/core/domain/restaurant";
import type { RestaurantRepository } from "@/core/domain/repositories/restaurant-repository";
import { getDb } from "./firebase-client";
import { toRestaurant } from "./mappers";

export class FirestoreRestaurantRepository implements RestaurantRepository {
  async getRestaurant(): Promise<Restaurant> {
    const snapshot = await getDocs(
      query(collection(getDb(), "restaurants"), limit(1)),
    );
    const first = snapshot.docs[0];
    if (!first) {
      throw new Error("No restaurant document found in Firestore.");
    }
    return toRestaurant(first.id, first.data());
  }

  async setOpen(isOpen: boolean): Promise<Restaurant> {
    const db = getDb();
    const snapshot = await getDocs(
      query(collection(db, "restaurants"), limit(1)),
    );
    const first = snapshot.docs[0];
    if (!first) {
      throw new Error("No restaurant document found in Firestore.");
    }
    await updateDoc(doc(db, "restaurants", first.id), { isOpen });
    return toRestaurant(first.id, { ...first.data(), isOpen });
  }
}
