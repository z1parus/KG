import Link from "next/link";
import type { Category } from "@/core/domain/category";

export function CategoryChips({ categories }: { categories: Category[] }) {
  return (
    <nav className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/menu/${category.id}`}
          className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
