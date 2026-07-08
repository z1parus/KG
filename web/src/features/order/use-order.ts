"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/core/domain/order";
import { orderRepository } from "@/lib/repositories";

interface OrderState {
  loading: boolean;
  error?: string;
  order?: Order | null;
}

export function useOrder(id: string): OrderState {
  const [state, setState] = useState<OrderState>({ loading: true });

  useEffect(() => {
    let active = true;
    orderRepository
      .getOrder(id)
      .then((order) => {
        if (active) setState({ loading: false, order });
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
