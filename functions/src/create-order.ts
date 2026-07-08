import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import type { Dish } from "./domain/dish";
import type { OrderDraft } from "./domain/order";
import { computePricing, resolveOrderItems } from "./domain/order-pricing";
import { findZone, validateDraft } from "./domain/order-validation";
import type { Promocode } from "./domain/promocode";
import type { Restaurant } from "./domain/restaurant";

async function nextOrderNumber(db: admin.firestore.Firestore): Promise<number> {
  const ref = db.collection("counters").doc("orders");
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = (snap.data()?.value as number | undefined) ?? 1041;
    const next = current + 1;
    tx.set(ref, { value: next }, { merge: true });
    return next;
  });
}

/**
 * Единственный способ создать заказ. Клиент шлёт черновик (без цен) — сервер
 * пересчитывает по меню из Firestore, валидирует, считает итог, присваивает номер.
 * Прямая запись клиента в `orders` запрещена Security Rules.
 */
export const createOrder = onCall<OrderDraft>(async (request) => {
  const draft = request.data;
  const db = admin.firestore();

  const [menuSnap, restaurantSnap] = await Promise.all([
    db.collection("menu").get(),
    db.collection("restaurants").limit(1).get(),
  ]);

  const dishes = menuSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Dish,
  );
  const restaurantDoc = restaurantSnap.docs[0];
  if (!restaurantDoc) {
    throw new HttpsError("failed-precondition", "Ресторан не настроен");
  }
  const restaurant = {
    id: restaurantDoc.id,
    ...restaurantDoc.data(),
  } as Restaurant;

  const { items, errors } = resolveOrderItems(draft.items, dishes);

  let promocode: Promocode | null = null;
  if (draft.promocode) {
    const promoSnap = await db
      .collection("promocodes")
      .where("code", "==", draft.promocode.trim().toUpperCase())
      .where("active", "==", true)
      .limit(1)
      .get();
    promocode = promoSnap.docs[0]
      ? (promoSnap.docs[0].data() as Promocode)
      : null;
    if (!promocode) errors.push("Промокод недействителен");
  }

  const allErrors = [...errors, ...validateDraft(draft, items, restaurant)];
  if (allErrors.length > 0) {
    throw new HttpsError("failed-precondition", allErrors.join("; "), {
      errors: allErrors,
    });
  }

  const zone =
    draft.fulfillment === "delivery"
      ? findZone(restaurant, draft.deliveryZoneName)
      : undefined;
  const pricing = computePricing(items, zone?.deliveryFee ?? 0, promocode);

  const number = await nextOrderNumber(db);
  const orderRef = db.collection("orders").doc();
  const now = admin.firestore.FieldValue.serverTimestamp();

  await orderRef.set({
    number,
    userId: request.auth?.uid ?? null,
    items,
    pricing,
    fulfillment: draft.fulfillment,
    deliveryAddress: draft.address ?? null,
    customer: draft.customer,
    scheduledTime: draft.scheduledTime ?? null,
    comment: draft.comment ?? null,
    paymentMethod: draft.paymentMethod,
    paymentStatus: "pending",
    promocodeId: promocode?.code ?? null,
    status: "new",
    statusHistory: [{ status: "new", at: new Date().toISOString() }],
    createdAt: now,
    updatedAt: now,
  });

  return { orderId: orderRef.id };
});
