"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category } from "@/core/domain/category";
import type { Dish } from "@/core/domain/dish";
import { menuRepository } from "@/lib/repositories";
import { Container } from "@/ui/Container";
import { Spinner } from "@/ui/Spinner";
import { DishCard } from "./DishCard";

interface State {
  loading: boolean;
  error?: string;
  category?: Category;
  dishes?: Dish[];
}

export function CategoryView({ categoryId }: { categoryId: string }) {
  const [state, setState] = useState<State>({ loading: true });

  useEffect(() => {
    let active = true;
    Promise.all([
      menuRepository.getCategories(),
      menuRepository.getDishesByCategory(categoryId),
    ])
      .then(([categories, dishes]) => {
        if (active) {
          setState({
            loading: false,
            category: categories.find((c) => c.id === categoryId),
            dishes,
          });
        }
      })
      .catch((error: unknown) => {
        if (active) setState({ loading: false, error: String(error) });
      });
    return () => {
      active = false;
    };
  }, [categoryId]);

  if (state.loading) {
    return (
      <Container className="py-16 text-center">
        <Spinner />
      </Container>
    );
  }
  if (state.error || !state.dishes) {
    return (
      <Container className="py-16 text-center text-muted-foreground">
        Не удалось загрузить категорию.
      </Container>
    );
  }

  return (
    <Container className="space-y-4 py-4">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-sm text-muted-foreground hover:text-brand">
          ← Меню
        </Link>
      </div>
      <h1 className="text-xl font-bold">
        {state.category?.name ?? "Категория"}
      </h1>
      {state.dishes.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {state.dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">В этой категории пока пусто.</p>
      )}
    </Container>
  );
}
