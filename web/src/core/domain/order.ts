import type { SelectedOption } from "./cart";

export type Fulfillment = "delivery" | "pickup";
export type PaymentMethod = "cash" | "card_on_delivery";
export type OrderStatus =
  | "new"
  | "accepted"
  | "cooking"
  | "ready"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export interface DeliveryAddress {
  street: string;
  house: string;
  apt?: string;
  entrance?: string;
  floor?: string;
  comment?: string;
}

export interface CustomerContact {
  name: string;
  phone: string;
}

/** Черновик заказа, который клиент отправляет на сервер. Без цен — их считает сервер. */
export interface OrderDraftItem {
  dishId: string;
  qty: number;
  selectedOptions: SelectedOption[];
}

export interface OrderDraft {
  items: OrderDraftItem[];
  fulfillment: Fulfillment;
  deliveryZoneName?: string;
  address?: DeliveryAddress;
  customer: CustomerContact;
  scheduledTime?: string | null;
  comment?: string;
  paymentMethod: PaymentMethod;
  promocode?: string;
}

/** Позиция заказа — снапшот на момент оформления (цена/название не ломаются при правках меню). */
export interface OrderItem {
  dishId: string;
  name: string;
  unitPrice: number;
  qty: number;
  selectedOptions: SelectedOption[];
  lineTotal: number;
}

export interface OrderPricing {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export interface Order {
  id: string;
  number: number;
  items: OrderItem[];
  pricing: OrderPricing;
  fulfillment: Fulfillment;
  address?: DeliveryAddress;
  customer: CustomerContact;
  scheduledTime?: string | null;
  comment?: string;
  paymentMethod: PaymentMethod;
  promocodeId?: string;
  status: OrderStatus;
  createdAt: string;
}

/** Ошибка валидации заказа — несёт список человекочитаемых причин для UI. */
export class OrderValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) {
    super(errors.join("; "));
    this.name = "OrderValidationError";
    this.errors = errors;
  }
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  new: "Оформлен",
  accepted: "Принят",
  cooking: "Готовится",
  ready: "Готов",
  on_the_way: "В пути",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Наличными курьеру",
  card_on_delivery: "Картой курьеру",
};
