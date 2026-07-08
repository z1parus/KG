import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

/**
 * Пуш ресторану при новом заказе. Устройства ресторана подписываются на topic
 * "restaurant" (FCM). Ошибки отправки не должны валить создание заказа.
 */
export const onOrderCreated = onDocumentCreated("orders/{orderId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;

  const number = data.number ?? "?";
  const total = data.pricing?.total ?? 0;

  try {
    await admin.messaging().send({
      topic: "restaurant",
      notification: {
        title: `Новый заказ №${number}`,
        body: `${data.fulfillment === "delivery" ? "Доставка" : "Самовывоз"} · ${total} ₽`,
      },
      data: { orderId: event.params.orderId },
    });
  } catch (error) {
    console.error("FCM send failed", error);
  }
});
