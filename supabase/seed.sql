-- Начальные данные (выполняется при `supabase db reset`; или применить вручную).
-- Соответствует web/src/data/seed/seed-data.ts.

insert into public.restaurants (id, name, phone, is_open, working_hours, delivery_zones, pickup_enabled, currency, address)
values (
  'local-1', 'Вкусный Уголок', '+7 900 000-00-00', true,
  '{"from":"10:00","to":"22:00"}',
  '[{"name":"Центр","minOrder":500,"deliveryFee":150,"estimatedTime":45},{"name":"Окраина","minOrder":800,"deliveryFee":250,"estimatedTime":60}]',
  true, 'RUB', 'г. Пример, ул. Центральная, 1'
) on conflict (id) do nothing;

insert into public.categories (id, name, "order", hidden) values
  ('pizza','Пицца',1,false),
  ('burgers','Бургеры',2,false),
  ('sides','Закуски',3,false),
  ('drinks','Напитки',4,false),
  ('desserts','Десерты',5,false)
on conflict (id) do nothing;

insert into public.promocodes (code, type, value, min_order, active) values
  ('WELCOME10','percent',10,500,true),
  ('FIX100','fixed',100,800,true)
on conflict (code) do nothing;

insert into public.menu (id, name, description, composition, category_id, price, weight, available, popular, options, allergens) values
  ('pizza-margherita','Пицца Маргарита','Классика на тонком тесте','Томатный соус, моцарелла, базилик','pizza',450,'420 г',true,true,
    '[{"id":"size","title":"Размер","required":true,"multiple":false,"choices":[{"id":"size-25","title":"25 см","priceDelta":0},{"id":"size-30","title":"30 см","priceDelta":150},{"id":"size-35","title":"35 см","priceDelta":300}]},{"id":"extras","title":"Добавки","required":false,"multiple":true,"choices":[{"id":"extra-cheese","title":"Двойной сыр","priceDelta":80},{"id":"extra-mushrooms","title":"Грибы","priceDelta":60}]}]',
    '["глютен","молоко"]'),
  ('pizza-pepperoni','Пицца Пепперони','Острая пикантная классика','Томатный соус, моцарелла, пепперони','pizza',550,'460 г',true,true,
    '[{"id":"size","title":"Размер","required":true,"multiple":false,"choices":[{"id":"size-25","title":"25 см","priceDelta":0},{"id":"size-30","title":"30 см","priceDelta":150},{"id":"size-35","title":"35 см","priceDelta":300}]}]',
    '["глютен","молоко"]'),
  ('pizza-four-cheese','Пицца Четыре сыра','Для любителей сыра','Сливочный соус, моцарелла, дорблю, пармезан, чеддер','pizza',620,'440 г',false,false,'[]','["глютен","молоко"]'),
  ('burger-classic','Бургер Классический','Сочная говяжья котлета','Булочка, говядина, сыр чеддер, салат, соус','burgers',320,'280 г',true,true,
    '[{"id":"extras","title":"Добавки","required":false,"multiple":true,"choices":[{"id":"bacon","title":"Бекон","priceDelta":70},{"id":"extra-patty","title":"Двойная котлета","priceDelta":120}]}]',
    '["глютен","молоко","яйцо"]'),
  ('burger-chicken','Бургер Куриный','Хрустящее куриное филе','Булочка, куриное филе, салат, соус ранч','burgers',290,'260 г',true,false,'[]','["глютен","яйцо"]'),
  ('fries','Картофель фри','Хрустящий, с солью','Картофель, соль, растительное масло','sides',150,'150 г',true,false,
    '[{"id":"sauce","title":"Соус","required":false,"multiple":false,"choices":[{"id":"ketchup","title":"Кетчуп","priceDelta":0},{"id":"cheese-sauce","title":"Сырный","priceDelta":40}]}]','[]'),
  ('nuggets','Наггетсы','6 штук куриных наггетсов','Куриное филе, панировка','sides',200,'180 г',true,false,'[]','["глютен"]'),
  ('cola','Кола','Газированный напиток','0.5 л','drinks',120,'500 мл',true,false,'[]','[]'),
  ('lemonade','Домашний лимонад','Освежающий цитрусовый','Лимон, мята, сироп','drinks',180,'400 мл',true,true,'[]','[]'),
  ('cheesecake','Чизкейк Нью-Йорк','Нежный сливочный десерт','Сливочный сыр, песочная основа','desserts',260,'150 г',true,false,'[]','["глютен","молоко","яйцо"]')
on conflict (id) do nothing;
