"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { computePricing } from "@/core/domain/order-pricing";
import { findZone } from "@/core/domain/order-validation";
import {
  OrderValidationError,
  paymentMethodLabels,
  type Fulfillment,
  type OrderDraft,
  type PaymentMethod,
} from "@/core/domain/order";
import type { Promocode } from "@/core/domain/promocode";
import { useCart } from "@/features/cart/cart-context";
import { useRestaurant } from "@/features/menu/hooks/use-restaurant";
import { orderRepository, promocodeRepository } from "@/lib/repositories";
import { Button } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Field } from "@/ui/Field";
import { Spinner } from "@/ui/Spinner";
import { TextInput } from "@/ui/TextInput";
import { PricingSummary } from "./PricingSummary";

const fulfillmentOptions: { value: Fulfillment; label: string }[] = [
  { value: "delivery", label: "Доставка" },
  { value: "pickup", label: "Самовывоз" },
];

const paymentOptions = Object.entries(paymentMethodLabels) as [
  PaymentMethod,
  string,
][];

export function CheckoutView() {
  const router = useRouter();
  const { cart, clear } = useCart();
  const { loading, restaurant } = useRestaurant();

  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [zoneName, setZoneName] = useState("");
  const [street, setStreet] = useState("");
  const [house, setHouse] = useState("");
  const [apt, setApt] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("cash");

  const [promoInput, setPromoInput] = useState("");
  const [promocode, setPromocode] = useState<Promocode | null>(null);
  const [promoError, setPromoError] = useState<string>();

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const effectiveZone =
    fulfillment === "delivery" && restaurant
      ? findZone(restaurant, zoneName || restaurant.deliveryZones[0]?.name)
      : undefined;

  const pricing = useMemo(
    () =>
      computePricing(
        cart.items.map((i) => ({ unitPrice: i.unitPrice, qty: i.qty })),
        effectiveZone?.deliveryFee ?? 0,
        promocode,
      ),
    [cart.items, effectiveZone, promocode],
  );

  if (loading) {
    return (
      <Container className="py-16 text-center">
        <Spinner />
      </Container>
    );
  }

  if (cart.items.length === 0) {
    return (
      <Container className="py-16 text-center text-muted-foreground">
        Корзина пуста.
      </Container>
    );
  }

  async function applyPromo() {
    setPromoError(undefined);
    const found = await promocodeRepository.findByCode(promoInput);
    if (!found) {
      setPromocode(null);
      setPromoError("Промокод не найден");
      return;
    }
    setPromocode(found);
  }

  async function submit() {
    setErrors([]);
    setSubmitting(true);
    const zoneForDraft =
      fulfillment === "delivery"
        ? zoneName || restaurant?.deliveryZones[0]?.name
        : undefined;
    const draft: OrderDraft = {
      items: cart.items.map((i) => ({
        dishId: i.dishId,
        qty: i.qty,
        selectedOptions: i.selectedOptions,
      })),
      fulfillment,
      deliveryZoneName: zoneForDraft,
      address:
        fulfillment === "delivery"
          ? { street, house, apt, comment }
          : undefined,
      customer: { name, phone },
      scheduledTime: null,
      comment: fulfillment === "pickup" ? comment : undefined,
      paymentMethod: payment,
      promocode: promocode?.code,
    };

    try {
      const order = await orderRepository.createOrder(draft);
      clear();
      router.push(`/order/${order.id}`);
    } catch (error) {
      if (error instanceof OrderValidationError) {
        setErrors(error.errors);
      } else {
        setErrors(["Не удалось оформить заказ. Попробуйте ещё раз."]);
      }
      setSubmitting(false);
    }
  }

  return (
    <Container className="space-y-6 py-4 pb-8">
      <h1 className="text-xl font-bold">Оформление заказа</h1>

      <section className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {fulfillmentOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFulfillment(option.value)}
              className={
                "h-11 rounded-xl border text-sm font-medium transition-colors " +
                (fulfillment === option.value
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-surface")
              }
            >
              {option.label}
            </button>
          ))}
        </div>

        {fulfillment === "delivery" && restaurant && (
          <div className="space-y-3">
            <Field label="Зона доставки">
              <select
                value={zoneName || restaurant.deliveryZones[0]?.name}
                onChange={(e) => setZoneName(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-surface px-3"
              >
                {restaurant.deliveryZones.map((zone) => (
                  <option key={zone.name} value={zone.name}>
                    {zone.name} · от {zone.minOrder} ₽ · доставка {zone.deliveryFee} ₽
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Улица">
                <TextInput value={street} onChange={(e) => setStreet(e.target.value)} />
              </Field>
              <Field label="Дом">
                <TextInput value={house} onChange={(e) => setHouse(e.target.value)} />
              </Field>
            </div>
            <Field label="Квартира / офис">
              <TextInput value={apt} onChange={(e) => setApt(e.target.value)} />
            </Field>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <Field label="Имя">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Телефон">
          <TextInput
            type="tel"
            inputMode="tel"
            placeholder="+7 900 000-00-00"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>
        <Field label={fulfillment === "delivery" ? "Комментарий курьеру" : "Комментарий к заказу"}>
          <TextInput value={comment} onChange={(e) => setComment(e.target.value)} />
        </Field>
      </section>

      <section className="space-y-2">
        <span className="text-sm font-medium">Оплата</span>
        {paymentOptions.map(([value, label]) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
          >
            <input
              type="radio"
              name="payment"
              checked={payment === value}
              onChange={() => setPayment(value)}
              className="accent-brand"
            />
            {label}
          </label>
        ))}
      </section>

      <section className="space-y-2">
        <span className="text-sm font-medium">Промокод</span>
        <div className="flex gap-2">
          <TextInput
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            placeholder="WELCOME10"
          />
          <Button variant="secondary" type="button" onClick={applyPromo}>
            Применить
          </Button>
        </div>
        {promoError && <p className="text-sm text-danger">{promoError}</p>}
        {promocode && pricing.discount > 0 && (
          <p className="text-sm text-success">Промокод «{promocode.code}» применён</p>
        )}
        {promocode && pricing.discount === 0 && (
          <p className="text-sm text-muted-foreground">
            Промокод действует от {promocode.minOrder} ₽
          </p>
        )}
      </section>

      <PricingSummary pricing={pricing} />

      {errors.length > 0 && (
        <ul className="space-y-1 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {errors.map((error) => (
            <li key={error}>• {error}</li>
          ))}
        </ul>
      )}

      <Button className="w-full" disabled={submitting} onClick={submit}>
        {submitting ? "Оформляем…" : "Подтвердить заказ"}
      </Button>
    </Container>
  );
}
