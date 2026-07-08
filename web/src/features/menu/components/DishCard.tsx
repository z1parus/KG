import Link from "next/link";
import type { Dish } from "@/core/domain/dish";
import { Badge } from "@/ui/Badge";
import { Price } from "@/ui/Price";
import { DishImage } from "./DishImage";

export function DishCard({ dish }: { dish: Dish }) {
  return (
    <Link
      href={`/dish/${dish.id}`}
      className="group flex gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-brand"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
        <DishImage
          imageUrl={dish.imageUrl}
          categoryId={dish.categoryId}
          alt={dish.name}
        />
        {!dish.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge tone="danger">нет в наличии</Badge>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{dish.name}</h3>
          {dish.popular && <Badge tone="brand">хит</Badge>}
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
          {dish.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <Price amount={dish.price} />
          <span className="text-xs text-muted-foreground">{dish.weight}</span>
        </div>
      </div>
    </Link>
  );
}
