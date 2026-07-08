"use client";

import { useEffect, useState } from "react";
import type { Dish } from "@/core/domain/dish";
import { menuRepository } from "@/lib/repositories";

interface DishState {
  loading: boolean;
  error?: string;
  dish?: Dish | null;
}

export function useDish(id: string): DishState {
  const [state, setState] = useState<DishState>({ loading: true });

  useEffect(() => {
    let active = true;
    menuRepository
      .getDish(id)
      .then((dish) => {
        if (active) setState({ loading: false, dish });
      })
      .catch((error: unknown) => {
        if (active) setState({ loading: false, error: String(error) });
      });
    return () => {
      active = false;
    };
  }, [id]);

  return state;
}
