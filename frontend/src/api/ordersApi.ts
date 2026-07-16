import axios from "axios";
import type { CreateOrderPayload, Order, OrderStatus } from "../types/order";

const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

export const client = axios.create({
  baseURL: `${baseUrl}/orders`,
});

export const getOrders = async (airportCode?: string): Promise<Order[]> => {
  const { data } = await client.get<Order[]>("/", {
    params: airportCode ? { airportCode } : {},
  });
  return data;
};

export const createOrder = async (
  orderData: CreateOrderPayload,
): Promise<Order> => {
  const { data } = await client.post<Order>("/", orderData);
  return data;
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
): Promise<Order> => {
  const { data } = await client.patch<Order>(`/${orderId}/status`, {
    status,
  });
  return data;
};
