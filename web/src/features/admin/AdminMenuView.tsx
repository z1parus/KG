"use client";

import { useEffect, useState } from "react";
import type { Dish } from "@/core/domain/dish";
import { menuRepository } from "@/lib/repositories";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Spinner } from "@/ui/Spinner";
import { TextInput } from "@/ui/TextInput";

export function AdminMenuView() {
  const [dishes, setDishes] = useState<Dish[] | null>(null);

  useEffect(() => {
    menuRepository.getDishes().then(setDishes);
  }, []);

  if (!dishes) {
    return (
      <Container className="py-16 text-center">
        <Spinner />
      </Container>
    );
  }

  function apply(updated: Dish) {
    setDishes((prev) =>
      prev ? prev.map((d) => (d.id === updated.id ? updated : d)) : prev,
    );
  }

  return (
    <Container className="space-y-3 py-4">
      <h1 className="text-xl font-bold">Меню</h1>
      <ul className="space-y-3">
        {dishes.map((dish) => (
          <DishRow key={dish.id} dish={dish} onApplied={apply} />
        ))}
      </ul>
    </Container>
  );
}

function DishRow({
  dish,
  onApplied,
}: {
  dish: Dish;
  onApplied: (dish: Dish) => void;
}) {
  const [name, setName] = useState(dish.name);
  const [price, setPrice] = useState(String(dish.price));
  const [available, setAvailable] = useState(dish.available);
  const [saving, setSaving] = useState(false);

  const dirty =
    name !== dish.name ||
    Number(price) !== dish.price ||
    available !== dish.available;

  async function save() {
    setSaving(true);
    try {
      const updated = await menuRepository.updateDish(dish.id, {
        name: name.trim() || dish.name,
        price: Number(price) || dish.price,
        available,
      });
      onApplied(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{dish.categoryId}</span>
        {!available && <Badge tone="danger">скрыто</Badge>}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px]">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        <TextInput
          type="number"
          inputMode="numeric"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            className="accent-brand"
          />
          В наличии
        </label>
        <Button size="sm" disabled={!dirty || saving} onClick={save}>
          {saving ? "Сохранение…" : "Сохранить"}
        </Button>
      </div>
    </li>
  );
}
