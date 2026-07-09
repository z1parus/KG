import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { Dish } from "./domain/dish.ts";
import type { OrderDraft } from "./domain/order.ts";
import { computePricing, resolveOrderItems } from "./domain/order-pricing.ts";
import { findZone, validateDraft } from "./domain/order-validation.ts";
import type { Promocode } from "./domain/promocode.ts";
import type { Restaurant } from "./domain/restaurant.ts";

// Единственный способ создать заказ. Клиент шлёт черновик (без цен) — функция
// пересчитывает по меню из БД, валидирует, считает итог, вставляет заказ с
// service-role (минуя RLS). Прямой insert клиента в orders запрещён политиками.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Row = Record<string, unknown>;

function toDish(row: Row): Dish {
  return {
    id: String(row.id),
    name: (row.name as string) ?? "",
    description: (row.description as string) ?? "",
    composition: (row.composition as string) ?? "",
    categoryId: (row.category_id as string) ?? "",
    price: (row.price as number) ?? 0,
    weight: (row.weight as string) ?? "",
    imageUrl: (row.image_url as string) ?? "",
    available: (row.available as boolean) ?? true,
    popular: (row.popular as boolean) ?? false,
    options: (row.options as Dish["options"]) ?? [],
    allergens: (row.allergens as string[]) ?? [],
  };
}

function toRestaurant(row: Row): Restaurant {
  return {
    id: String(row.id),
    name: (row.name as string) ?? "",
    phone: (row.phone as string) ?? "",
    isOpen: (row.is_open as boolean) ?? false,
    workingHours: (row.working_hours as Restaurant["workingHours"]) ?? {
      from: "00:00",
      to: "00:00",
    },
    deliveryZones: (row.delivery_zones as Restaurant["deliveryZones"]) ?? [],
    pickupEnabled: (row.pickup_enabled as boolean) ?? false,
    currency: (row.currency as Restaurant["currency"]) ?? "RUB",
    address: (row.address as string) ?? "",
  };
}

function toPromocode(row: Row): Promocode {
  return {
    code: (row.code as string) ?? "",
    type: (row.type as Promocode["type"]) ?? "percent",
    value: (row.value as number) ?? 0,
    minOrder: (row.min_order as number) ?? 0,
    active: (row.active as boolean) ?? false,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  try {
    const draft = (await req.json()) as OrderDraft;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const [menuRes, restRes] = await Promise.all([
      supabase.from("menu").select("*"),
      supabase.from("restaurants").select("*").limit(1),
    ]);
    if (menuRes.error) return json({ errors: [menuRes.error.message] }, 500);

    const dishes = (menuRes.data ?? []).map(toDish);
    const restaurantRow = restRes.data?.[0];
    if (!restaurantRow) return json({ errors: ["Ресторан не настроен"] }, 422);
    const restaurant = toRestaurant(restaurantRow);

    const { items, errors } = resolveOrderItems(draft.items, dishes);

    let promocode: Promocode | null = null;
    if (draft.promocode) {
      const { data } = await supabase
        .from("promocodes")
        .select("*")
        .eq("code", draft.promocode.trim().toUpperCase())
        .eq("active", true)
        .maybeSingle();
      promocode = data ? toPromocode(data) : null;
      if (!promocode) errors.push("Промокод недействителен");
    }

    const allErrors = [...errors, ...validateDraft(draft, items, restaurant)];
    if (allErrors.length > 0) return json({ errors: allErrors }, 422);

    const zone =
      draft.fulfillment === "delivery"
        ? findZone(restaurant, draft.deliveryZoneName)
        : undefined;
    const pricing = computePricing(items, zone?.deliveryFee ?? 0, promocode);

    const { data: inserted, error } = await supabase
      .from("orders")
      .insert({
        items,
        pricing,
        fulfillment: draft.fulfillment,
        address: draft.address ?? null,
        customer: draft.customer,
        scheduled_time: draft.scheduledTime ?? null,
        comment: draft.comment ?? null,
        payment_method: draft.paymentMethod,
        promocode_id: promocode?.code ?? null,
        status: "new",
        status_history: [{ status: "new", at: new Date().toISOString() }],
      })
      .select("id")
      .single();
    if (error) return json({ errors: [error.message] }, 500);

    return json({ orderId: inserted.id });
  } catch (e) {
    return json({ errors: [String(e)] }, 500);
  }
});
