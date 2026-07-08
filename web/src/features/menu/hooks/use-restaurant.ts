"use client";

import { useEffect, useState } from "react";
import type { Restaurant } from "@/core/domain/restaurant";
import { restaurantRepository } from "@/lib/repositories";

interface RestaurantState {
  loading: boolean;
  error?: string;
  restaurant?: Restaurant;
}

export function useRestaurant(): RestaurantState {
  const [state, setState] = useState<RestaurantState>({ loading: true });

  useEffect(() => {
    let active = true;
    restaurantRepository
      .getRestaurant()
      .then((restaurant) => {
        if (active) setState({ loading: false, restaurant });
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
