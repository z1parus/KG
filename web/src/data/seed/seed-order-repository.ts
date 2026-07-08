import {
  OrderValidationError,
  type Order,
  type OrderDraft,
  type OrderStatus,
} from "@/core/domain/order";
import { computePricing, resolveOrderItems } from "@/core/domain/order-pricing";
import { findZone, validateDraft } from "@/core/domain/order-validation";
import type { MenuRepository } from "@/core/domain/repositories/menu-repository";
import type { OrderRepository } from "@/core/domain/repositories/order-repository";
import type { PromocodeRepository } from "@/core/domain/repositories/promocode-repository";
import type { RestaurantRepository } from "@/core/domain/repositories/restaurant-repository";

const ORDERS_KEY = "kg.orders.v1";
const COUNTER_KEY = "kg.orderNumber.v1";

function loadOrders(): Record<string, Order> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(ORDERS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveOrder(order: Order): void {
  if (typeof window === "undefined") return;
  const orders = loadOrders();
  orders[order.id] = order;
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function nextNumber(): number {
  if (typeof window === "undefined") return 1000;
  const current = Number(window.localStorage.getItem(COUNTER_KEY) ?? "1041");
  const next = current + 1;
  window.localStorage.setItem(COUNTER_KEY, String(next));
  return next;
}

/**
 * Заглушка серверной логики (аналог Cloud Function createOrder).
 * Пересчитывает цены по меню, валидирует, считает итог, присваивает номер.
 * Клиентские цены игнорируются — источник правды здесь.
 */
export class SeedOrderRepository implements OrderRepository {
  constructor(
    private readonly menu: MenuRepository,
    private readonly restaurant: RestaurantRepository,
    private readonly promocodes: PromocodeRepository,
  ) {}

  async createOrder(draft: OrderDraft): Promise<Order> {
    const [dishes, restaurant] = await Promise.all([
      this.menu.getDishes(),
      this.restaurant.getRestaurant(),
    ]);

    const { items, errors: itemErrors } = resolveOrderItems(draft.items, dishes);

    const promocode = draft.promocode
      ? await this.promocodes.findByCode(draft.promocode)
      : null;
    if (draft.promocode && !promocode) {
      itemErrors.push("Промокод недействителен");
    }

    const validationErrors = validateDraft(draft, items, restaurant);
    const errors = [...itemErrors, ...validationErrors];
    if (errors.length > 0) {
      throw new OrderValidationError(errors);
    }

    const zone =
      draft.fulfillment === "delivery"
        ? findZone(restaurant, draft.deliveryZoneName)
        : undefined;
    const deliveryFee = zone?.deliveryFee ?? 0;
    const pricing = computePricing(items, deliveryFee, promocode);

    const order: Order = {
      id: crypto.randomUUID(),
      number: nextNumber(),
      items,
      pricing,
      fulfillment: draft.fulfillment,
      address: draft.address,
      customer: draft.customer,
      scheduledTime: draft.scheduledTime ?? null,
      comment: draft.comment,
      paymentMethod: draft.paymentMethod,
      promocodeId: promocode?.code,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    saveOrder(order);
    return order;
  }

  async getOrder(id: string): Promise<Order | null> {
    return loadOrders()[id] ?? null;
  }

  async listOrders(): Promise<Order[]> {
    return Object.values(loadOrders()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = loadOrders()[id];
    if (!order) {
      throw new Error(`Заказ не найден: ${id}`);
    }
    const updated: Order = { ...order, status };
    saveOrder(updated);
    return updated;
  }
}
