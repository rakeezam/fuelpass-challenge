import { useCallback, useState } from "react";
import { updateOrderStatus } from "../api/ordersApi";
import type { Order, OrderStatus } from "../types/order";

export const useUpdateStatus = () => {
  const [updatedOrder, setUpdatedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      setIsLoading(true);
      setError(null);

      try {
        const updated = await updateOrderStatus(orderId, status);
        setUpdatedOrder(updated);
        return updated;
      } catch (err) {
        const updateError =
          err instanceof Error
            ? err
            : new Error("Failed to update order status");
        setError(updateError);
        throw updateError;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { updatedOrder, isLoading, error, updateStatus };
};
