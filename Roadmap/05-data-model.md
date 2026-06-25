# 05. Модель данных (Firestore)

> Предполагается Firebase/Firestore. Для Supabase схема переносится в реляционные таблицы
> с теми же сущностями и FK-связями; realtime — через подписки на таблицы.

## Коллекции верхнего уровня

```
restaurants/{restaurantId}
menu/{dishId}
categories/{categoryId}
orders/{orderId}
users/{userId}
addresses/{addressId}        # subcollection users/{uid}/addresses
promocodes/{codeId}
banners/{bannerId}          # промо на главном экране
```

## `restaurants/{restaurantId}`

```ts
{
  id: string
  name: string
  phone: string
  isOpen: boolean             // управляется из админки
  workingHours: { from: "10:00", to: "22:00" }
  deliveryZones: [
    { name: "Центр", minOrder: 500, deliveryFee: 150, estimatedTime: 45 }
  ]
  pickupEnabled: boolean
  currency: "RUB"
  contacts: { address, geo { lat, lng } }
  updatedAt: timestamp
}
```

## `categories/{categoryId}`

```ts
{
  id: string
  name: string                // "Пицца", "Напитки"
  order: number               // сортировка
  hidden: boolean
  imageUrl?: string           // иконка категории
}
```

## `menu/{dishId}`

```ts
{
  id: string
  name: string
  description: string
  composition: string         // состав/ингредиенты
  categoryId: string
  price: number               // базовая цена
  weight: string              // "350 г"
  imageUrl: string            // Storage URL
  available: boolean          // наличие
  popular: boolean            // блок "популярное"
  options: [                  // опции блюда (размер/добавки)
    {
      id: string
      title: "Размер"
      required: boolean
      multiple: boolean       // можно выбрать несколько
      choices: [
        { id, title, priceDelta }
      ]
    }
  ]
  allergens: [string]         // ["молоко", "глютен"]
  createdAt: timestamp
  updatedAt: timestamp
}
```

## `orders/{orderId}`

```ts
{
  id: string
  number: number              // человекочитаемый № (например, 1042)
  userId?: string             // null для анонимного заказа
  customer: {
    name: string
    phone: string             // E.164
  }
  fulfillment: "delivery" | "pickup"
  deliveryAddress?: {
    street: string
    house: string
    apt: string
    entrance?: string
    floor?: number
    comment?: string
    geo?: { lat, lng }
  }
  scheduledTime?: timestamp   // null = "как можно быстрее"
  items: [
    {
      dishId: string
      name: string            // снапшот на момент заказа (история не ломается при изменении меню)
      price: number           // цена на момент заказа
      qty: number
      options: [ { optionId, choiceIds: [string] } ]
      lineTotal: number       // qty * price + сумма priceDelta
    }
  ]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number               // источник правды — сервер (Cloud Functions)
  promocodeId?: string
  paymentMethod: "cash" | "card_on_delivery" | "online"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  status: "new" | "accepted" | "cooking" | "ready" | "on_the_way" | "delivered" | "cancelled"
  statusHistory: [
    { status, at: timestamp, by?: string }
  ]
  comment?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

## `users/{userId}`

```ts
{
  id: string
  name: string
  phone: string               // уникальный
  email?: string
  role: "customer"            // "admin" — отдельная коллекция для персонала ресторана
  loyaltyPoints: number
  createdAt: timestamp
}
```

## `users/{uid}/addresses/{addressId}`

```ts
{
  id: string
  label: string               // "Дом", "Работа"
  street, house, apt, entrance, floor
  geo?: { lat, lng }
}
```

## `promocodes/{codeId}`

```ts
{
  code: "WELCOME10"
  type: "percent" | "fixed"
  value: number               // 10 (% или руб)
  minOrder: number            // порог применимости
  validFrom: timestamp
  validTo: timestamp
  active: boolean
  usageLimit?: number
  usedCount: number
}
```

## `banners/{bannerId}`

```ts
{
  id: string
  title: string
  imageUrl: string
  targetDishId?: string
  targetCategoryId?: string
  active: boolean
  order: number
}
```

## Индексы Firestore

- `menu`: `categoryId` ASC, `order`/`popular` — составные индексы для ленты.
- `orders`: `userId` ASC, `createdAt` DESC — история пользователя.
- `orders`: `status` ASC, `createdAt` DESC — лента админки.
- `banners`: `active=true, order ASC`.

## Security Rules (набросок)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    // публичное чтение
    match /{rest=restaurants} { allow read: if true; }
    match /{c=categories}    { allow read: if true; }
    match /{b=banners}       { allow read: if true; }
    match /{m=menu}          { allow read: if true; }
    match /{p=promocodes}    { allow read: if true; } // не возвращать скрытые поля

    // заказы
    match /orders/{orderId} {
      allow create: if requestIsValid();   // см. helpers
      allow read:   if isOwner(orderId) || isAdmin();
      allow update: if isAdmin();          // статусы меняет только ресторан (или Cloud Functions)
    }

    // приватное
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid || isAdmin();
      match /addresses/{aid} {
        allow read, write: if request.auth.uid == uid || isAdmin();
      }
    }

    function isAdmin() {
      return request.auth.token.role == "admin";
    }
    function isOwner(id) {
      return request.auth.uid == getResource(...).data.userId;
    }
    function requestIsValid() {
      // базовая проверка: phone, total>0, items непустой и т.п.
      // детальная валидация — в Cloud Functions (сервер)
      return request.resource.data.total is number && request.resource.data.total > 0;
    }
  }
}
```

> Создание заказа клиентом идёт через Cloud Function `createOrder` (запретить прямую запись
> в `orders` из приложения, оставить только create-через-function и read своих заказов).