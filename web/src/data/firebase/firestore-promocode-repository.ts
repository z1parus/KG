import { collection, getDocs, limit, query, where } from "firebase/firestore";
import type { Promocode } from "@/core/domain/promocode";
import type { PromocodeRepository } from "@/core/domain/repositories/promocode-repository";
import { getDb } from "./firebase-client";
import { toPromocode } from "./mappers";

export class FirestorePromocodeRepository implements PromocodeRepository {
  async findByCode(code: string): Promise<Promocode | null> {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return null;
    const snapshot = await getDocs(
      query(
        collection(getDb(), "promocodes"),
        where("code", "==", normalized),
        where("active", "==", true),
        limit(1),
      ),
    );
    const first = snapshot.docs[0];
    return first ? toPromocode(first.data()) : null;
  }
}
