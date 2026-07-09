# Вкусный Уголок — веб-приложение заказа еды

Веб-клиент приложения заказа еды из локального ресторана. Стек: **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4**, бэкенд — **Supabase (Postgres + RLS + Edge Functions)** за слоем репозиториев. Общий контекст и план — в каталоге [`../Roadmap`](../Roadmap). Рабочие заметки по разработке — в [`../CLAUDE.md`](../CLAUDE.md).

## Запуск

```bash
npm install
npm run dev          # http://localhost:3000
```

Без переменных окружения приложение работает на **seed-данных** (`src/data/seed`), поэтому запускается сразу, без настройки Supabase.

### Подключение Supabase

```bash
cp .env.example .env.local   # заполнить URL и anon-ключ из панели Supabase
```

Как только заданы `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`, composition root (`src/lib/repositories.ts`) автоматически переключает источник данных с seed на Supabase. Код приложения при этом не меняется — оно зависит только от интерфейсов репозиториев. Полная инструкция — в [`../SUPABASE.md`](../SUPABASE.md).

## Команды

| Команда | Назначение |
|---|---|
| `npm run dev` | Dev-сервер (Turbopack) |
| `npm run build` | Продакшн-сборка |
| `npm run start` | Запуск собранного приложения |
| `npm run lint` | ESLint |
| `npm run test` | Unit-тесты (Vitest) |

## Архитектура (кратко)

```
src/
├── core/            # фреймворко-независимое ядро (без React/Supabase)
│   └── domain/      #   сущности, cart-логика, интерфейсы репозиториев
├── data/            # адаптеры данных, реализуют интерфейсы из core
│   ├── seed/        #   локальные данные (dev, без ключей)
│   └── supabase/    #   Postgres (supabase-js) + маппинг
├── lib/             # composition root: выбор реализации репозиториев
├── ui/              # дизайн-система (базовые компоненты на токенах)
├── features/        # фичи (feature-first): menu, cart
└── app/             # роуты Next.js (тонкие, делегируют в features)
```

Подробнее — в `../CLAUDE.md` (раздел «Архитектура и правила»).
