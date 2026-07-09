import {
  OrderValidationError,
  type Order,
  type OrderDraft,
  type OrderStatus,
} from "@/core/domain/order";
import type { OrderRepository } from "@/core/domain/repositories/order-repository";
import { getSupabase } from "./supabase-client";
import { rowToOrder } from "./mappers";

/**
 * Заказ создаётся ТОЛЬКО через Edge Function `create-order` (серверная валидация и
 * подсчёт итога). Прямой insert в таблицу `orders` запрещён RLS — защита от подмены
 * цены (roadmap, риск №4). Смена статуса разрешена роли admin (RLS).
 */
export class SupabaseOrderRepository implements OrderRepository {
  async createOrder(draft: OrderDraft): Promise<Order> {
    const { data, error } = await getSupabase().functions.invoke<{
      orderId: string;
    }>("create-order", { body: draft });

    if (error) {
      const body = await extractErrorBody(error);
      if (body?.errors?.length) {
        throw new OrderValidationError(body.errors);
      }
      throw error;
    }
    if (!data?.orderId) {
      throw new Error("Edge Function не вернула orderId");
    }
    const order = await this.getOrder(data.orderId);
    if (!order) {
      throw new Error("Заказ не найден после создания");
    }
    return order;
  }

  async getOrder(id: string): Promise<Order | null> {
    const { data, error } = await getSupabase()
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToOrder(data) : null;
  }

  async listOrders(): Promise<Order[]> {
    const { data, error } = await getSupabase()
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToOrder);
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const { data, error } = await getSupabase()
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return rowToOrder(data);
  }

  watchOrders(onChange: () => void): () => void {
    const channel = getSupabase()
      .channel("orders-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => onChange(),
      )
      .subscribe();
    return () => {
      void getSupabase().removeChannel(channel);
    };
  }
}

async function extractErrorBody(
  error: unknown,
): Promise<{ errors?: string[] } | null> {
  const context = (error as { context?: Response }).context;
  if (!context || typeof context.json !== "function") return null;
  try {
    return (await context.json()) as { errors?: string[] };
  } catch {
    return null;
  }
}
