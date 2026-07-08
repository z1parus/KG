import { doc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import type { Order, OrderDraft } from "@/core/domain/order";
import type { OrderRepository } from "@/core/domain/repositories/order-repository";
import { getDb, getFirebaseApp } from "./firebase-client";
import { toOrder } from "./mappers";

/**
 * Реальная реализация: создание заказа делегируется Cloud Function `createOrder`
 * (серверная валидация и подсчёт итога). Прямая запись в `orders` из клиента запрещена
 * Security Rules. Требует развёрнутой функции — см. CLAUDE.md, раздел «Серверная часть».
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
}
