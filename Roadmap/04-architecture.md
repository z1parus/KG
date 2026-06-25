# 04. Архитектура приложения

## Принципы

1. **Feature-first модульность** — код группируется по фичам (menu, cart, checkout, orders, profile),
   а не по типам файлов. Каждая фича — отдельный пакет или папка.
2. **Разделение слоёв**: UI → Контроллер (state) → Репозиторий → Сервис данных (BaaS).
3. **Зависимости направлены внутрь**: UI зависит от контроллеров, контроллеры — от репозиториев,
   репозитории — от абстракций BaaS (легко мокать в тестах).
4. **Иммутабельность моделей** через freezed.
5. **Тестируемость**: репозитории за интерфейсами, мокаемые в тестах.

## Слои (для клиентского приложения)

```
┌────────────────────────────────────────────┐
│  UI (Widgets, Screens)                    │  Flutter-виджеты, роутинг go_router
├────────────────────────────────────────────┤
│  Presentation / State (Riverpod providers) │  Состояние фичи, бизнес-правила UI
├────────────────────────────────────────────┤
│  Domain (Entities, Use Cases)              │  Чистые модели и сценарии (Dart-классы)
├────────────────────────────────────────────┤
│  Data (Repositories, Data Sources)         │  BaaS-адаптеры, маппинг DTO↔Entity
└────────────────────────────────────────────┘
```

## Структура фичи (пример menu)

```
features/menu/
├── menu.dart                     # публичный API фичи (exports)
├── presentation/
│   ├── screens/menu_screen.dart
│   ├── widgets/
│   │   ├── category_list.dart
│   │   └── dish_card.dart
│   └── providers/
│       └── menu_provider.dart
├── application/
│   └── menu_controller.dart      # Riverpod notifier с состоянием
├── domain/
│   ├── entities/
│   │   ├── dish.dart
│   │   └── category.dart
│   └── repositories/
│       └── menu_repository.dart (abstract)
└── data/
    ├── dto/
    │   └── dish_dto.dart
    ├── repositories/
    │   └── menu_repository_impl.dart
    └── sources/
        └── menu_firestore_source.dart
```

## Управление состоянием (Riverpod)

- **NotifierProvider** для состояния фичи (список блюд, корзина, текущий заказ).
- **FutureProvider** для «прочитал — показал» (меню, профиль).
- **StreamProvider** для realtime-данных (статус заказа, лента заказов админа).
- **StateProvider** для простого UI-состояния (выбранная категория).
- Глобальное состояние (корзина, сессия пользователя) — в корневых провайдерах, доступных из любой фичи.

## Навигация (go_router)

- Декларативные маршруты: `/`, `/menu/:categoryId`, `/dish/:id`, `/cart`, `/checkout`,
  `/orders`, `/orders/:id`, `/profile`, `/admin`, `/admin/orders`.
- ShellRoute для нижней навигации клиента и для сайдбара админки.
- Deep-link: `/orders/:id` для push-уведомлений.

## Поток данных — пример оформления заказа

```
[Checkout Screen]
   └─→ CheckoutController (Riverpod)
        └─→ OrderRepository.createOrder(orderDraft)
             └─→ Cloud Functions: validateOrder()
                  ├─ проверка промокода, минималки, наличия блюд
                  ├─ подсчёт итога (сервер — источник правды)
                  └─ запись в Firestore: orders/{orderId}
                       ├─ статус: "new"
                       └─ FCM-пуш ресторану (через onCreate trigger)
   ←── orderId / экран успеха
```

> **Важно**: итоговую сумму и валидацию заказа считает **сервер** (Cloud Functions),
> а не клиент. Клиент только отправляет «черновик» заказа. Это защищает от подмены цен.

## Realtime-обновления

- Статус заказа — `StreamProvider` на `orders/{orderId}` (Firestore snapshots).
- Лента заказов админа — `StreamProvider` на `orders where status in [...]`.
- Push (FCM) — дополнительный канал на случай закрытого приложения.

## Аутентификация

- MVP: заказы **без обязательной регистрации** (анонимный заказ по телефону).
- Фаза 4: FirebaseAuth (phone/email), связывание анонимной учётки с постоянной при регистрации.
- Сессия хранится в FirebaseAuth, токен передаётся в Firestore/Functions автоматически.

## Безопасность

- **Firestore Security Rules**: клиенты могут писать заказы только в `orders` и только с
  предсказуемыми полями; чтение — только свои заказы; меню — публичное чтение.
- **Админ-доступ**: кастомные claim `role: admin` через Cloud Functions, проверка в правилах.
- **App Check** (позже): защита BaaS от неавторизованных клиентов.
- **Валидация входных данных** в Cloud Functions (цены, количества, ID).

## Разделение окружений

- `firebase_options_dev.dart` / `_prod.dart` через `--flavor` и `flutter_dotenv`.
- Отдельные проекты Firebase: `food-dev`, `food-prod`.
- Админ-панель подключается к `prod` (с подтверждением роли).