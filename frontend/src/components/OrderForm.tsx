import { useState } from "react";
import { z } from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateOrder } from "../hooks/useCreateOrder";

const isFutureDate = (value: string) => {
  const date = new Date(value);
  return !isNaN(date.getTime()) && date.getTime() > Date.now();
};

const orderFormSchema = z.object({
  tailNumber: z.string().min(1, { error: "Tail Number is required" }),
  airportIcaoCode: z.string().regex(/^[A-Za-z]{4}$/, {
    error: "Airport ICAO Code must be exactly 4 letters",
  }),
  requestedFuelVolume: z
    .number({ error: "Requested Fuel Volume is required" })
    .positive({ error: "Requested Fuel Volume must be greater than 0" }),
  deliveryWindowStart: z
    .string()
    .min(1, { error: "Delivery Window Start is required" })
    .refine(isFutureDate, {
      error: "Delivery Window Start must be in the future",
    }),
  deliveryWindowEnd: z
    .string()
    .min(1, { error: "Delivery Window End is required" })
    .refine(isFutureDate, {
      error: "Delivery Window End must be in the future",
    }),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;

export const OrderForm = () => {
  const { submitOrder, isSubmitting, error } = useCreateOrder();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderFormData>({ resolver: zodResolver(orderFormSchema) });

  const onSubmit: SubmitHandler<OrderFormData> = async (data) => {
    setIsSuccess(false);

    try {
      await submitOrder({
        ...data,
        deliveryWindowStart: new Date(data.deliveryWindowStart).toISOString(),
        deliveryWindowEnd: new Date(data.deliveryWindowEnd).toISOString(),
      });
      reset();
      setIsSuccess(true);
    } catch {
      // avoiding unhandled rejection - error is already caught in useCreateOrder's error state
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-md space-y-4"
    >
      <div>
        <label
          htmlFor="tailNumber"
          className="block text-sm font-medium text-gray-700"
        >
          Tail Number
        </label>
        <input
          id="tailNumber"
          type="text"
          {...register("tailNumber")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.tailNumber && (
          <p className="mt-1 text-sm text-red-600">
            {errors.tailNumber.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="airportIcaoCode"
          className="block text-sm font-medium text-gray-700"
        >
          Airport ICAO Code
        </label>
        <input
          id="airportIcaoCode"
          type="text"
          maxLength={4}
          {...register("airportIcaoCode")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.airportIcaoCode && (
          <p className="mt-1 text-sm text-red-600">
            {errors.airportIcaoCode.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="requestedFuelVolume"
          className="block text-sm font-medium text-gray-700"
        >
          Requested Fuel Volume (litres)
        </label>
        <input
          id="requestedFuelVolume"
          type="number"
          step="any"
          {...register("requestedFuelVolume", { valueAsNumber: true })}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.requestedFuelVolume && (
          <p className="mt-1 text-sm text-red-600">
            {errors.requestedFuelVolume.message}
          </p>
        )}
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-gray-700">
          Delivery Time Window
        </legend>
        <p className="mt-1 text-xs text-gray-500">
          Times shown in your local timezone.
        </p>
        <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="deliveryWindowStart"
              className="block text-xs text-gray-500"
            >
              Start
            </label>
            <input
              id="deliveryWindowStart"
              type="datetime-local"
              {...register("deliveryWindowStart")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.deliveryWindowStart && (
              <p className="mt-1 text-sm text-red-600">
                {errors.deliveryWindowStart.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="deliveryWindowEnd"
              className="block text-xs text-gray-500"
            >
              End
            </label>
            <input
              id="deliveryWindowEnd"
              type="datetime-local"
              {...register("deliveryWindowEnd")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.deliveryWindowEnd && (
              <p className="mt-1 text-sm text-red-600">
                {errors.deliveryWindowEnd.message}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {error && <p className="text-sm text-red-600">{error.message}</p>}
      {isSuccess && (
        <p className="text-sm text-green-600">Order submitted successfully.</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit Order"}
      </button>
    </form>
  );
};
