import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Единый источник правды доменной логики — web/src/core/domain.
// Cloud Function переиспользует эти чистые (без React/Firebase) файлы, копируя их
// в src/domain (генерируется, в git не хранится). Так сервер и клиент считают
// цену и валидацию по одному коду — без расхождений (roadmap, риск №4).

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "..", "..", "web", "src", "core", "domain");
const target = join(here, "..", "src", "domain");

const files = [
  "money.ts",
  "category.ts",
  "dish.ts",
  "restaurant.ts",
  "cart.ts",
  "promocode.ts",
  "order.ts",
  "order-pricing.ts",
  "order-validation.ts",
];

mkdirSync(target, { recursive: true });
for (const file of files) {
  copyFileSync(join(source, file), join(target, file));
}
console.log(`copy-domain: скопировано ${files.length} файлов из core/domain`);
