"use client";

import { useMemo, useState } from "react";
import type { Category } from "@/core/domain/category";
import type { Dish } from "@/core/domain/dish";
import { useMenu } from "@/features/menu/hooks/use-menu";
import { Container } from "@/ui/Container";
import { SectionHeader } from "@/ui/SectionHeader";
import { Spinner } from "@/ui/Spinner";
import { CategoryChips } from "./CategoryChips";
import { DishCard } from "./DishCard";
import { MenuSearch } from "./MenuSearch";

export function MenuView() {
  const { loading, error, data } = useMenu();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return data.dishes.filter((d) => d.name.toLowerCase().includes(normalized));
  }, [data, query]);

  if (loading) {
    return (
      <Container className="py-16 text-center">
        <Spinner />
      </Container>
    );
  }
  if (error || !data) {
    return (
      <Container className="py-16 text-center text-muted-foreground">
        Не удалось загрузить меню.
      </Container>
    );
  }

  const dishesByCategory = (category: Category): Dish[] =>
    data.dishes.filter((d) => d.categoryId === category.id);

  return (
    <Container className="space-y-8 py-4">
      <MenuSearch value={query} onChange={setQuery} />

      {query.trim() ? (
        <section>
          <SectionHeader title={`Найдено: ${filtered.length}`} />
          {filtered.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((dish) => (
                <DishCard key={dish.id} dish={dish} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Ничего не найдено.</p>
          )}
        </section>
      ) : (
        <>
          <CategoryChips categories={data.categories} />

          {data.popular.length > 0 && (
            <section>
              <SectionHeader title="Популярное" />
              <div className="grid gap-3 sm:grid-cols-2">
                {data.popular.map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
              </div>
            </section>
          )}

          {data.categories.map((category) => {
            const dishes = dishesByCategory(category);
            if (dishes.length === 0) return null;
            return (
              <section key={category.id} id={category.id}>
                <SectionHeader title={category.name} />
                <div className="grid gap-3 sm:grid-cols-2">
                  {dishes.map((dish) => (
                    <DishCard key={dish.id} dish={dish} />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </Container>
  );
}
