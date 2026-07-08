"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/core/domain/category";
import type { Dish } from "@/core/domain/dish";
import { menuRepository } from "@/lib/repositories";

export interface MenuData {
  categories: Category[];
  dishes: Dish[];
  popular: Dish[];
}

interface MenuState {
  loading: boolean;
  error?: string;
  data?: MenuData;
}

export function useMenu(): MenuState {
  const [state, setState] = useState<MenuState>({ loading: true });

  useEffect(() => {
    let active = true;
    Promise.all([
      menuRepository.getCategories(),
      menuRepository.getDishes(),
      menuRepository.getPopular(),
    ])
      .then(([categories, dishes, popular]) => {
        if (active) setState({ loading: false, data: { categories, dishes, popular } });
      })
      .catch((error: unknown) => {
        if (active) setState({ loading: false, error: String(error) });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
