import { useState, type ReactNode } from "react";
import { useOrders } from "../hooks/useOrders";
import { useUpdateStatus } from "../hooks/useUpdateStatus";
import { StatusBadge } from "./StatusBadge";
import type { OrderStatus } from "../types/order";

interface OrderTableProps {
  airportCode?: string;
}

const Th = ({ children }: { children: ReactNode }) => (
  <th
    scope="col"
    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
  >
    {children}
  </th>
);

const Td = ({ children }: { children: ReactNode }) => (
  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
    {children}
  </td>
);

const NEXT_STATUS_ACTION: Record<
  OrderStatus,
  { next: OrderStatus; label: string } | null
> = {
  PENDING: { next: "CONFIRMED", label: "Confirm" },
  CONFIRMED: { next: "COMPLETED", label: "Complete" },
  COMPLETED: null,
};

const formatDateTime = (value: string) => new Date(value).toLocaleString();

export const OrderTable = ({ airportCode }: OrderTableProps) => {
  const { orders, isLoading, error, refetch } = useOrders(airportCode);
  const { updateStatus, error: updateError } = useUpdateStatus();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleUpdateStatus = async (
    orderId: string,
    nextStatus: OrderStatus,
  ) => {
    setUpdatingOrderId(orderId);

    try {
      await updateStatus(orderId, nextStatus);
      await refetch();
    } catch {
      // error is already reflected in useUpdateStatus's `error` state
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-sm text-red-600">{error.message}</p>;

  return (
    <div>
      {updateError && (
        <p className="mb-2 text-sm text-red-600">{updateError.message}</p>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <Th>Tail Number</Th>
            <Th>Airport</Th>
            <Th>Requested Volume</Th>
            <Th>Delivery Window</Th>
            <Th>Status</Th>
            <Th>Update Status</Th>
            <Th>Created At</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {orders.map((order) => {
            const nextAction = NEXT_STATUS_ACTION[order.status];
            const isUpdating = updatingOrderId === order.id;

            return (
              <tr key={order.id}>
                <Td>{order.tailNumber}</Td>
                <Td>{order.airportIcaoCode}</Td>
                <Td>{order.requestedFuelVolume} L</Td>
                <Td>
                  {formatDateTime(order.deliveryWindowStart)} –{" "}
                  {formatDateTime(order.deliveryWindowEnd)}
                </Td>
                <Td>
                  <StatusBadge status={order.status} />
                </Td>
                <Td>
                  {nextAction && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        handleUpdateStatus(order.id, nextAction.next)
                      }
                      className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isUpdating ? "Updating..." : nextAction.label}
                    </button>
                  )}
                </Td>
                <Td>{formatDateTime(order.createdAt)}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
