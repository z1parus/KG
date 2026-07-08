"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildCartItem,
  unitPriceFor,
  type SelectedOption,
} from "@/core/domain/cart";
import type { Dish } from "@/core/domain/dish";
import { useCart } from "@/features/cart/cart-context";
import { useDish } from "@/features/menu/hooks/use-dish";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Price } from "@/ui/Price";
import { QtyStepper } from "@/ui/QtyStepper";
import { Spinner } from "@/ui/Spinner";
import { DishImage } from "./DishImage";

type Selection = Record<string, string[]>;

function initialSelection(dish: Dish): Selection {
  const selection: Selection = {};
  for (const option of dish.options) {
    selection[option.id] =
      option.required && !option.multiple && option.choices[0]
        ? [option.choices[0].id]
        : [];
  }
  return selection;
}

function toSelectedOptions(selection: Selection): SelectedOption[] {
  return Object.entries(selection).map(([optionId, choiceIds]) => ({
    optionId,
    choiceIds,
  }));
}

export function DishView({ id }: { id: string }) {
  const { loading, error, dish } = useDish(id);

  if (loading) {
    return (
      <Container className="py-16 text-center">
        <Spinner />
      </Container>
    );
  }
  if (error || !dish) {
    return (
      <Container className="py-16 text-center text-muted-foreground">
        Блюдо не найдено.
      </Container>
    );
  }
  return <DishDetail dish={dish} />;
}

function DishDetail({ dish }: { dish: Dish }) {
  const router = useRouter();
  const { add } = useCart();
  const [selection, setSelection] = useState<Selection>(() =>
    initialSelection(dish),
  );
  const [qty, setQty] = useState(1);

  const selectedOptions = useMemo(() => toSelectedOptions(selection), [selection]);
  const unitPrice = useMemo(
    () => unitPriceFor(dish, selectedOptions),
    [dish, selectedOptions],
  );

  const missingRequired = dish.options.some(
    (option) => option.required && (selection[option.id]?.length ?? 0) === 0,
  );

  function toggleChoice(optionId: string, choiceId: string, multiple: boolean) {
    setSelection((prev) => {
      const current = prev[optionId] ?? [];
      if (multiple) {
        return {
          ...prev,
          [optionId]: current.includes(choiceId)
            ? current.filter((id) => id !== choiceId)
            : [...current, choiceId],
        };
      }
      return { ...prev, [optionId]: [choiceId] };
    });
  }

  function handleAdd() {
    add(buildCartItem(dish, selectedOptions, qty));
    router.push("/cart");
  }

  return (
    <Container className="pb-28 pt-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="relative aspect-video">
          <DishImage
            imageUrl={dish.imageUrl}
            categoryId={dish.categoryId}
            alt={dish.name}
          />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold">{dish.name}</h1>
            {dish.popular && <Badge tone="brand">хит</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{dish.weight}</p>
          <p className="mt-3">{dish.description}</p>
          {dish.composition && (
            <p className="mt-2 text-sm text-muted-foreground">
              Состав: {dish.composition}
            </p>
          )}
          {dish.allergens.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Аллергены: {dish.allergens.join(", ")}
            </p>
          )}
        </div>
      </div>

      {dish.options.map((option) => (
        <section key={option.id} className="mt-5">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="font-semibold">{option.title}</h2>
            {option.required && <Badge tone="neutral">обязательно</Badge>}
          </div>
          <div className="flex flex-col gap-2">
            {option.choices.map((choice) => {
              const checked = (selection[option.id] ?? []).includes(choice.id);
              return (
                <label
                  key={choice.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type={option.multiple ? "checkbox" : "radio"}
                      name={option.id}
                      checked={checked}
                      onChange={() =>
                        toggleChoice(option.id, choice.id, option.multiple)
                      }
                      className="accent-brand"
                    />
                    {choice.title}
                  </span>
                  {choice.priceDelta > 0 && (
                    <span className="text-sm text-muted-foreground">
                      +<Price amount={choice.priceDelta} />
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </section>
      ))}

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-surface">
        <Container className="flex items-center gap-3 py-3">
          <QtyStepper value={qty} onChange={setQty} />
          <Button
            className="flex-1"
            disabled={!dish.available || missingRequired}
            onClick={handleAdd}
          >
            {dish.available ? (
              <>
                В корзину · <Price amount={unitPrice * qty} className="font-semibold" />
              </>
            ) : (
              "Нет в наличии"
            )}
          </Button>
        </Container>
      </div>
    </Container>
  );
}
