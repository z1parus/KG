-- Схема и политики доступа (RLS) приложения заказа еды.
-- Соответствует доменной модели web/src/core/domain и Roadmap/05-data-model.md.

create sequence if not exists public.order_number_seq start with 1042;

create table if not exists public.restaurants (
  id text primary key,
  name text not null,
  phone text,
  is_open boolean not null default true,
  working_hours jsonb not null default '{}'::jsonb,
  delivery_zones jsonb not null default '[]'::jsonb,
  pickup_enabled boolean not null default true,
  currency text not null default 'RUB',
  address text,
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  name text not null,
  "order" int not null default 0,
  hidden boolean not null default false,
  image_url text
);

create table if not exists public.menu (
  id text primary key,
  name text not null,
  description text not null default '',
  composition text not null default '',
  category_id text references public.categories (id),
  price int not null default 0,
  weight text not null default '',
  image_url text not null default '',
  available boolean not null default true,
  popular boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  allergens jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists menu_category_idx on public.menu (category_id);

create table if not exists public.promocodes (
  code text primary key,
  type text not null check (type in ('percent', 'fixed')),
  value int not null,
  min_order int not null default 0,
  active boolean not null default true
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number int not null default nextval('public.order_number_seq'),
  user_id uuid references auth.users (id),
  items jsonb not null,
  pricing jsonb not null,
  fulfillment text not null,
  address jsonb,
  customer jsonb not null,
  scheduled_time timestamptz,
  comment text,
  payment_method text not null,
  payment_status text not null default 'pending',
  promocode_id text,
  status text not null default 'new',
  status_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_user_created_idx on public.orders (user_id, created_at desc);

-- Роль администратора: claim role=admin в app_metadata JWT.
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

alter table public.restaurants enable row level security;
alter table public.categories  enable row level security;
alter table public.menu        enable row level security;
alter table public.promocodes  enable row level security;
alter table public.orders      enable row level security;

-- Витрина: публичное чтение (через anon-ключ).
create policy "restaurants read" on public.restaurants for select using (true);
create policy "categories read"  on public.categories  for select using (true);
create policy "menu read"        on public.menu        for select using (true);
create policy "promocodes read"  on public.promocodes  for select using (true);

-- Запись в витрину — только админ.
create policy "restaurants admin" on public.restaurants for all
  using (public.is_admin()) with check (public.is_admin());
create policy "categories admin"  on public.categories  for all
  using (public.is_admin()) with check (public.is_admin());
create policy "menu admin"        on public.menu        for all
  using (public.is_admin()) with check (public.is_admin());
create policy "promocodes admin"  on public.promocodes  for all
  using (public.is_admin()) with check (public.is_admin());

-- Заказы: insert клиенту запрещён (нет политики) — пишет только Edge Function
-- с service-role ключом, минуя RLS. Это защита от подмены цены (риск №4).
create policy "orders read" on public.orders for select
  using (public.is_admin() or user_id = auth.uid());
create policy "orders admin update" on public.orders for update
  using (public.is_admin()) with check (public.is_admin());

-- Привилегии ролей. RLS выше фильтрует строки, но доступ к таблице даёт именно
-- GRANT: без него PostgREST под ролью anon/authenticated получает
-- "permission denied for table" ещё до проверки политик.
grant usage on schema public to anon, authenticated;

-- Витрина: публичное чтение; запись — под authenticated (строки гейтит is_admin()).
grant select on public.restaurants, public.categories, public.menu, public.promocodes
  to anon, authenticated;
grant insert, update, delete
  on public.restaurants, public.categories, public.menu, public.promocodes
  to authenticated;

-- Заказы: клиент их не вставляет (insert не выдан) — только читает/обновляет под
-- authenticated (RLS ограничивает свои/админ). Insert делает Edge Function под
-- service_role, который обходит и GRANT, и RLS.
grant select, update on public.orders to authenticated;

grant all on public.restaurants, public.categories, public.menu,
              public.promocodes, public.orders to service_role;
grant usage, select on sequence public.order_number_seq to service_role;

-- Realtime: заказы должны попасть в публикацию supabase_realtime, иначе
-- postgres_changes по orders не приходят. Добавляем идемпотентно.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public' and tablename = 'orders'
     ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;
