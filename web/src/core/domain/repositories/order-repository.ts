import type { Order, OrderDraft } from "../order";

export interface OrderRepository {
  createOrder(draft: OrderDraft): Promise<Order>;
  getOrder(id: string): Promise<Order | null>;
}
