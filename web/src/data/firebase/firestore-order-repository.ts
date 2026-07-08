import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import type { Order, OrderDraft, OrderStatus } from "@/core/domain/order";
import type { OrderRepository } from "@/core/domain/repositories/order-repository";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getDb, getFirebaseApp } from "./firebase-client";
import { toOrder } from "./mappers";

/**
 * Реальная реализация: создание заказа делегируется Cloud Function `createOrder`
 * (серверная валидация и подсчёт итога). Прямая запись в `orders` из клиента запрещена
 * Security Rules. Смена статуса — только для роли admin (тоже в правилах).
 * Требует развёрнутой функции — см. CLAUDE.md, раздел «Серверная часть».
 */
export class FirestoreOrderRepository implements OrderRepository {
  async createOrder(draft: OrderDraft): Promise<Order> {
    const callable = httpsCallable<OrderDraft, { orderId: string }>(
      getFunctions(getFirebaseApp()),
      "createOrder",
    );
    const { data } = await callable(draft);
    const order = await this.getOrder(data.orderId);
    if (!order) {
      throw new Error("Заказ не найден после создания");
    }
    return order;
  }

  async getOrder(id: string): Promise<Order | null> {
    const snapshot = await getDoc(doc(getDb(), "orders", id));
    return snapshot.exists() ? toOrder(snapshot.id, snapshot.data()) : null;
  }

  async listOrders(): Promise<Order[]> {
    const snapshot = await getDocs(
      query(collection(getDb(), "orders"), orderBy("createdAt", "desc")),
    );
    return snapshot.docs.map((d) => toOrder(d.id, d.data()));
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const db = getDb();
    await updateDoc(doc(db, "orders", id), {
      status,
      updatedAt: new Date().toISOString(),
    });
    const updated = await this.getOrder(id);
    if (!updated) {
      throw new Error(`Заказ не найден: ${id}`);
    }
    return updated;
  }
}
