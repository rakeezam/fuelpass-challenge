import { useCallback, useState } from "react";
import { createOrder } from "../api/ordersApi";
import type { CreateOrderPayload, Order } from "../types/order";

export const useCreateOrder = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitOrder = useCallback(async (orderData: CreateOrderPayload) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const createdOrder = await createOrder(orderData);
      setOrder(createdOrder);
      return createdOrder;
    } catch (err) {
      const submitError =
        err instanceof Error ? err : new Error("Failed to create order");
      setError(submitError);
      throw submitError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { order, isSubmitting, error, submitOrder };
};
