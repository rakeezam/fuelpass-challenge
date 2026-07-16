export type OrderStatus = "PENDING" | "CONFIRMED" | "COMPLETED";

export interface Order {
  id: string;
  tailNumber: string;
  airportIcaoCode: string;
  requestedFuelVolume: number;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  status: OrderStatus;
  createdAt: string;
}

export type CreateOrderPayload = Omit<Order, "id" | "status" | "createdAt">;
