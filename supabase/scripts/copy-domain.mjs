import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Единый источник правды доменной логики — web/src/core/domain.
// Edge Function (Deno) переиспользует эти чистые файлы. Копируем их в
// functions/create-order/domain (генерируется, в git не хранится) и добавляем
// расширения ".ts" к относительным импортам — этого требует Deno.

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "..", "..", "web", "src", "core", "domain");
const target = join(here, "..", "functions", "create-order", "domain");

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
  const src = join(source, file);
  const dst = join(target, file);
  copyFileSync(src, dst);
  const patched = readFileSync(dst, "utf8").replace(
    /from "(\.\/[a-zA-Z0-9-]+)"/g,
    'from "$1.ts"',
  );
  writeFileSync(dst, patched);
}
console.log(`copy-domain: ${files.length} файлов скопировано в create-order/domain`);
