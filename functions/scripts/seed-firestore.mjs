import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Наполнение Firestore начальными данными (одноразовый bootstrap).
// Требует Application Default Credentials: задайте GOOGLE_APPLICATION_CREDENTIALS
// (путь к service-account.json) и FIREBASE_PROJECT_ID (id проекта).
// Запуск: cd functions && npm run seed
// Данные соответствуют web/src/data/seed/seed-data.ts.

const projectId =
  process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
if (!projectId) {
  console.error("Задайте FIREBASE_PROJECT_ID (id вашего Firebase-проекта).");
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore();

const restaurant = {
  id: "local-1",
  name: "Вкусный Уголок",
  phone: "+7 900 000-00-00",
  isOpen: true,
  workingHours: { from: "10:00", to: "22:00" },
  deliveryZones: [
    { name: "Центр", minOrder: 500, deliveryFee: 150, estimatedTime: 45 },
    { name: "Окраина", minOrder: 800, deliveryFee: 250, estimatedTime: 60 },
  ],
  pickupEnabled: true,
  currency: "RUB",
  contacts: { address: "г. Пример, ул. Центральная, 1" },
};

const categories = [
  { id: "pizza", name: "Пицца", order: 1, hidden: false },
  { id: "burgers", name: "Бургеры", order: 2, hidden: false },
  { id: "sides", name: "Закуски", order: 3, hidden: false },
  { id: "drinks", name: "Напитки", order: 4, hidden: false },
  { id: "desserts", name: "Десерты", order: 5, hidden: false },
];

const promocodes = [
  { code: "WELCOME10", type: "percent", value: 10, minOrder: 500, active: true },
  { code: "FIX100", type: "fixed", value: 100, minOrder: 800, active: true },
];

const sizeOption = {
  id: "size",
  title: "Размер",
  required: true,
  multiple: false,
  choices: [
    { id: "size-25", title: "25 см", priceDelta: 0 },
    { id: "size-30", title: "30 см", priceDelta: 150 },
    { id: "size-35", title: "35 см", priceDelta: 300 },
  ],
};

const dishes = [
  { id: "pizza-margherita", name: "Пицца Маргарита", description: "Классика на тонком тесте", composition: "Томатный соус, моцарелла, базилик", categoryId: "pizza", price: 450, weight: "420 г", imageUrl: "", available: true, popular: true, options: [sizeOption, { id: "extras", title: "Добавки", required: false, multiple: true, choices: [{ id: "extra-cheese", title: "Двойной сыр", priceDelta: 80 }, { id: "extra-mushrooms", title: "Грибы", priceDelta: 60 }] }], allergens: ["глютен", "молоко"] },
  { id: "pizza-pepperoni", name: "Пицца Пепперони", description: "Острая пикантная классика", composition: "Томатный соус, моцарелла, пепперони", categoryId: "pizza", price: 550, weight: "460 г", imageUrl: "", available: true, popular: true, options: [sizeOption], allergens: ["глютен", "молоко"] },
  { id: "pizza-four-cheese", name: "Пицца Четыре сыра", description: "Для любителей сыра", composition: "Сливочный соус, моцарелла, дорблю, пармезан, чеддер", categoryId: "pizza", price: 620, weight: "440 г", imageUrl: "", available: false, popular: false, options: [], allergens: ["глютен", "молоко"] },
  { id: "burger-classic", name: "Бургер Классический", description: "Сочная говяжья котлета", composition: "Булочка, говядина, сыр чеддер, салат, соус", categoryId: "burgers", price: 320, weight: "280 г", imageUrl: "", available: true, popular: true, options: [{ id: "extras", title: "Добавки", required: false, multiple: true, choices: [{ id: "bacon", title: "Бекон", priceDelta: 70 }, { id: "extra-patty", title: "Двойная котлета", priceDelta: 120 }] }], allergens: ["глютен", "молоко", "яйцо"] },
  { id: "burger-chicken", name: "Бургер Куриный", description: "Хрустящее куриное филе", composition: "Булочка, куриное филе, салат, соус ранч", categoryId: "burgers", price: 290, weight: "260 г", imageUrl: "", available: true, popular: false, options: [], allergens: ["глютен", "яйцо"] },
  { id: "fries", name: "Картофель фри", description: "Хрустящий, с солью", composition: "Картофель, соль, растительное масло", categoryId: "sides", price: 150, weight: "150 г", imageUrl: "", available: true, popular: false, options: [{ id: "sauce", title: "Соус", required: false, multiple: false, choices: [{ id: "ketchup", title: "Кетчуп", priceDelta: 0 }, { id: "cheese-sauce", title: "Сырный", priceDelta: 40 }] }], allergens: [] },
  { id: "nuggets", name: "Наггетсы", description: "6 штук куриных наггетсов", composition: "Куриное филе, панировка", categoryId: "sides", price: 200, weight: "180 г", imageUrl: "", available: true, popular: false, options: [], allergens: ["глютен"] },
  { id: "cola", name: "Кола", description: "Газированный напиток", composition: "0.5 л", categoryId: "drinks", price: 120, weight: "500 мл", imageUrl: "", available: true, popular: false, options: [], allergens: [] },
  { id: "lemonade", name: "Домашний лимонад", description: "Освежающий цитрусовый", composition: "Лимон, мята, сироп", categoryId: "drinks", price: 180, weight: "400 мл", imageUrl: "", available: true, popular: true, options: [], allergens: [] },
  { id: "cheesecake", name: "Чизкейк Нью-Йорк", description: "Нежный сливочный десерт", composition: "Сливочный сыр, песочная основа", categoryId: "desserts", price: 260, weight: "150 г", imageUrl: "", available: true, popular: false, options: [], allergens: ["глютен", "молоко", "яйцо"] },
];

async function seed() {
  const batch = db.batch();
  batch.set(db.collection("restaurants").doc(restaurant.id), restaurant);
  for (const c of categories) batch.set(db.collection("categories").doc(c.id), c);
  for (const d of dishes) batch.set(db.collection("menu").doc(d.id), d);
  for (const p of promocodes) batch.set(db.collection("promocodes").doc(p.code), p);
  batch.set(db.collection("counters").doc("orders"), { value: 1041 });
  await batch.commit();
  console.log(
    `seed: ресторан, ${categories.length} категорий, ${dishes.length} блюд, ${promocodes.length} промокодов записаны.`,
  );
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
