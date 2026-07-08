"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/core/domain/order";
import { orderRepository } from "@/lib/repositories";

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    orderRepository
      .listOrders()
      .then((list) => {
        if (active) {
          setOrders(list);
          setError(undefined);
        }
      })
      .catch((e: unknown) => {
        if (active) setError(String(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      setOrders(await orderRepository.listOrders());
      setError(undefined);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  const setStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      await orderRepository.updateOrderStatus(id, status);
      await refresh();
    },
    [refresh],
  );

  return { orders, loading, error, refresh, setStatus };
}
