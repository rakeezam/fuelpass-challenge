import { useState } from "react";
import { useOrders } from "../hooks/useOrders";
import { useUpdateStatus } from "../hooks/useUpdateStatus";
import { StatusBadge } from "./StatusBadge";
import type { OrderStatus } from "../types/order";

interface OrderTableProps {
  airportCode?: string;
}

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
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Tail Number
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Airport
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Requested Volume
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Delivery Window
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Created At
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {orders.map((order) => {
            const nextAction = NEXT_STATUS_ACTION[order.status];
            const isUpdating = updatingOrderId === order.id;

            return (
              <tr key={order.id}>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {order.tailNumber}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {order.airportIcaoCode}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {order.requestedFuelVolume} L
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {formatDateTime(order.deliveryWindowStart)} –{" "}
                  {formatDateTime(order.deliveryWindowEnd)}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.status} />
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
                  </div>
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {formatDateTime(order.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
