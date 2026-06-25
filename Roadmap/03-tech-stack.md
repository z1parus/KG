# 03. Технологический стек

## Клиент (Flutter)

**Рекомендация**: единая кодовая база Flutter под iOS, Android и Web. Это сильно сокращает работу
маленькой команды и соответствует требованию «веб + мобильное».

| Слой | Технология | Обоснование |
|---|---|---|
| UI-фреймворк | **Flutter (stable channel)** | Один код → 3 платформы; знакомый вам стек |
| Язык | **Dart** | Единый язык с Flutter |
| Управление состоянием | **Riverpod 2.x** (или Bloc) | Riverpod — безопаснее/современнее Provider; Bloc — для команд, любящих строгие конечные автоматы. **Рекомендация: Riverpod** |
| Навигация | **go_router** | Декларативная навигация, удобно для deep-links и веба |
| Сериализация | **freezed + json_serializable** | Иммутабельные модели, union types, copyWith |
| HTTP/данные | **cloud_firestore / supabase_flutter** | Прямо из BaaS |
| Изображения | **cached_network_image** | Кэш и плейсхолдеры для фото блюд |
| Локальное хранилище | **shared_preferences** + **hive** (для офлайн-кэша) | SP — настройки; Hive — кэш меню |
| Карта (фаза 2+) | **yandex_mapkit** или **google_maps_flutter** | Выбор по гео; для РФ — Яндекс |
| Локализация | **flutter intl / arb** | Стандарт i18n во Flutter |
| Иконки | **flutter_svg** + Material Symbols | |
| Тесты | **flutter_test**, **integration_test**, **mocktail** | Unit + widget + интеграционные |

## Бэкенд (BaaS)

**Рекомендация: Firebase** — первоклассная поддержка Flutter, всё «из коробки»: auth, db, storage,
functions, push, analytics, crashlytics, remote config. Идеально для маленькой команды.

### Что используем из Firebase
| Сервис | Назначение |
|---|---|
| **Authentication** | Регистрация по телефону/email; анонимные заказы на MVP |
| **Cloud Firestore** | Основная БД: меню, заказы, пользователи |
| **Cloud Storage** | Фото блюд, баннеры |
| **Cloud Functions** | Серверная логика: валидация промокодов, подсчёт суммы, отправка push ресторану, 54-ФЗ-чеки |
| **Cloud Messaging (FCM)** | Push о статусах заказов |
| **Crashlytics** | Отслеживание падений |
| **Analytics (GA4)** | Продуктовые события |
| **Remote Config** | Флаги фич, часы работы, мин. сумма заказа без перевыпуска |
| **App Check** | Защита от злоупотреблений (позже) |

### Альтернатива: Supabase
- PostgreSQL + Row Level Security + Auth + Storage + Edge Functions + Realtime.
- **Плюсы**: реляционная БД (удобнее для заказов/финансов), прозрачная модель данных, дешевле на масштабе.
- **Минусы**: меньше готовых расширений «под ключ» (нет аналогов Remote Config, Crashlytics, A/B), чуть больше своей работы.
- **Когда выбрать Supabase**: если важна строгая консистентность транзакций (платежи, склад) или не хочется lock-in в Google.

> Решение принять в Фазе 0. В этом roadmap предполагается Firebase; переход на Supabase меняет
> в основном `05-data-model.md` и `04-architecture.md` (репозитории).

## Платформа админ-панели ресторана

Варианты:
1. **Веб на Flutter** (тот же репозиторий, таргет `web`) — меньше переключений контекста, общий код моделей.
2. **Отдельный веб на Flutter/React** — если ресторану нужна своя независимая поставка.

**Рекомендация**: один репозиторий, Flutter-веб с роутом `/admin/*`, общие модели и BaaS-слой.
Раздельные приложения (`flutter_app`, `flutter_admin`) — оба могут шарить пакет `core`.

## CI/CD и инфраструктура

| Назначение | Инструмент |
|---|---|
| Репозиторий | Git (GitHub/GitLab) |
| CI | GitHub Actions / GitLab CI |
| Линт | `flutter_lints` + `dart format` |
| Сборка web | `flutter build web` → Firebase Hosting |
| Распределение бета | Firebase App Distribution |
| Секреты | Firestore Security Rules + Environment Config (flutter_dotenv) |
| Среды | 2 Firebase-проекта: `dev` и `prod` (минимум) |

## Структура пакетов (предложение)

```
food_order/
├── apps/
│   ├── customer_app/      # клиентское приложение (iOS/Android/Web)
│   └── admin_app/         # админ-панель ресторана (Web)
├── packages/
│   ├── core/              # модели, репозитории, сервисы BaaS, утилиты
│   ├── ui_kit/            # дизайн-система, переиспользуемые виджеты
│   └── features/          # фичи как отдельные пакеты (menu, cart, checkout, ...)
└── melos.yaml             # управление монорепо (melos)
```

> Монорепо + Melos даёт переиспользование между customer и admin и ускоряет маленькую команду.