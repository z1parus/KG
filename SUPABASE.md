# Подключение Supabase

Пока переменные `NEXT_PUBLIC_SUPABASE_*` не заданы, приложение работает на seed-данных.
Ниже — как перевести его на реальный Supabase. Серверный слой уже готов (`supabase/`:
миграция схемы + RLS, seed, Edge Function `create-order`).

## 0. Предпосылки

- Проект на [supabase.com](https://supabase.com) (бесплатного тарифа достаточно для старта;
  Edge Functions входят в него, отдельный платный план не нужен).
- Supabase CLI: `npm i -g supabase`, затем `supabase login`.

## 1. Ключи веб-приложения

Панель проекта → **Project Settings → API**. Заполните `web/.env.local`
(см. `web/.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

`anon`-ключ публичный (уходит в бандл) — это нормально, доступ ограничивают RLS-политики.
После этого composition root (`web/src/lib/repositories.ts`) сам переключится на Supabase.

## 2. Схема, политики и данные

Из корня репозитория:

```bash
supabase link --project-ref <ваш-ref>
supabase db push                       # применит migrations/ (схему + RLS)
```

Наполнение начальными данными — выполните `supabase/seed.sql` (SQL Editor в панели
или `psql`), либо при локальной разработке `supabase db reset` (применит миграции и seed).

## 3. Edge Function `create-order`

Единственный способ создать заказ: сервер пересчитывает цены по меню, валидирует,
считает итог и пишет заказ с service-role (минуя RLS). Прямой insert клиента запрещён.

```bash
node supabase/scripts/copy-domain.mjs   # копирует core/domain в функцию
supabase functions deploy create-order
```

`SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` доступны функции автоматически.
Секрет не покидает сервер.

## 4. Роль администратора

Смена статусов и запись в `menu` разрешены пользователю с claim `role=admin` в
`app_metadata` (проверяется функцией `public.is_admin()` в RLS). Назначить:

```bash
# через Admin API / SQL:
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
where email = 'you@example.com';
```

> Экран входа админа (`/admin/login`, Supabase Auth) и realtime-лента заказов
> (`supabase.channel(...).on('postgres_changes', ...)`) — следующий шаг; их удобнее
> подключать и проверять уже на живом проекте.

## Как устроено переиспользование логики

`supabase/scripts/copy-domain.mjs` копирует чистые доменные файлы из
`web/src/core/domain` в функцию (добавляя `.ts` к импортам для Deno). Итог заказа и
валидацию и клиент (для оценки), и сервер (источник правды) считают по одному коду.
