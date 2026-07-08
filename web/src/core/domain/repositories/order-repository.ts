import type { Order, OrderDraft, OrderStatus } from "../order";

export interface OrderRepository {
  createOrder(draft: OrderDraft): Promise<Order>;
  getOrder(id: string): Promise<Order | null>;
  /** Админ: все заказы, новые сверху. */
  listOrders(): Promise<Order[]>;
  /** Админ: смена статуса заказа. */
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order>;
}
