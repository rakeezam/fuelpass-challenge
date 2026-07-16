import { useCallback, useEffect, useState } from "react";
import { getOrders } from "../api/ordersApi";
import type { Order } from "../types/order";

export const useOrders = (airportCode?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getOrders(airportCode);
      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch orders"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [airportCode]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, error, refetch: fetchOrders };
};
