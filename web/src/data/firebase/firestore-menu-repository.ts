import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import type { Category } from "@/core/domain/category";
import type { Dish } from "@/core/domain/dish";
import type {
  DishPatch,
  MenuRepository,
} from "@/core/domain/repositories/menu-repository";
import { getDb } from "./firebase-client";
import { toCategory, toDish } from "./mappers";

export class FirestoreMenuRepository implements MenuRepository {
  async getCategories(): Promise<Category[]> {
    const db = getDb();
    const snapshot = await getDocs(
      query(collection(db, "categories"), orderBy("order")),
    );
    return snapshot.docs
      .map((d) => toCategory(d.id, d.data()))
      .filter((c) => !c.hidden);
  }

  async getDishes(): Promise<Dish[]> {
    const db = getDb();
    const snapshot = await getDocs(collection(db, "menu"));
    return snapshot.docs.map((d) => toDish(d.id, d.data()));
  }

  async getDishesByCategory(categoryId: string): Promise<Dish[]> {
    const db = getDb();
    const snapshot = await getDocs(
      query(collection(db, "menu"), where("categoryId", "==", categoryId)),
    );
    return snapshot.docs.map((d) => toDish(d.id, d.data()));
  }

  async getDish(id: string): Promise<Dish | null> {
    const db = getDb();
    const snapshot = await getDoc(doc(db, "menu", id));
    return snapshot.exists() ? toDish(snapshot.id, snapshot.data()) : null;
  }

  async getPopular(): Promise<Dish[]> {
    const db = getDb();
    const snapshot = await getDocs(
      query(collection(db, "menu"), where("popular", "==", true)),
    );
    return snapshot.docs
      .map((d) => toDish(d.id, d.data()))
      .filter((d) => d.available);
  }

  async searchDishes(query_: string): Promise<Dish[]> {
    const normalized = query_.trim().toLowerCase();
    if (!normalized) return [];
    const all = await this.getDishes();
    return all.filter((d) => d.name.toLowerCase().includes(normalized));
  }

  async updateDish(id: string, patch: DishPatch): Promise<Dish> {
    const db = getDb();
    await updateDoc(doc(db, "menu", id), { ...patch });
    const updated = await this.getDish(id);
    if (!updated) {
      throw new Error(`Блюдо не найдено: ${id}`);
    }
    return updated;
  }
}
