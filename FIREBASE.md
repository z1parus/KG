# Подключение Firebase

Пока переменные `NEXT_PUBLIC_FIREBASE_*` не заданы, приложение работает на seed-данных.
Ниже — как перевести его на реальный Firebase. Серверный код уже готов (`functions/`,
`firestore.rules`, `firestore.indexes.json`, `firebase.json`, скрипт наполнения).

## 0. Предпосылки

- Аккаунт Google и **Firebase-проект** (console.firebase.google.com).
- Тариф **Blaze** (Cloud Functions 2nd gen требуют его; в пределах free-квоты почти бесплатно).
- Установленный Firebase CLI: `npm i -g firebase-tools`, затем `firebase login`.

## 1. Ключи веб-приложения

В консоли: **Project settings → Your apps → Web app** (создайте, если нет). Скопируйте
конфиг и заполните `web/.env.local` (см. `web/.env.example`):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Эти значения не секретны (они попадают в клиентский бандл) — их можно передавать.
После этого composition root (`web/src/lib/repositories.ts`) сам переключится на Firestore.

## 2. Инициализация проекта

В корне репозитория:

```bash
firebase use --add        # выбрать созданный проект
firebase deploy --only firestore:rules,firestore:indexes
```

Включите в консоли: **Firestore Database**, **Authentication** (Email/Password),
**Cloud Messaging** (для пушей).

## 3. Наполнение данными

```bash
export FIREBASE_PROJECT_ID=<ваш-project-id>
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json   # из Project settings → Service accounts
cd functions
npm install
npm run seed
```

Запишет `restaurants`, `categories`, `menu`, `promocodes`, счётчик заказов.

## 4. Деплой функций

```bash
firebase deploy --only functions
```

- `createOrder` — единственный способ создать заказ (валидация и подсчёт итога на сервере).
- `onOrderCreated` — пуш ресторану (устройства ресторана подписать на FCM-topic `restaurant`).

## 5. Роль администратора

Смена статусов и запись в `menu` разрешены только пользователю с claim `admin=true`.
Назначить (разово, через Admin SDK / отдельный скрипт):

```js
await admin.auth().setCustomUserClaims(uid, { admin: true });
```

> Экран входа админа (`/admin/login`) и realtime-лента (`onSnapshot`) — следующий шаг:
> их удобнее подключать и проверять уже на живом проекте.

## Как устроено переиспользование логики

`functions/scripts/copy-domain.mjs` копирует чистые доменные файлы из
`web/src/core/domain` в `functions/src/domain` на этапе сборки. Итог заказа и валидацию
и клиент (для оценки), и сервер (источник правды) считают по одному коду — без расхождений.
