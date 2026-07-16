import { z } from "zod";

// Prevents "now" getting rejected
const START_TIME_GRACE_PERIOD_MS = 5 * 60 * 1000;

const createIsFutureDate = (graceMs = 0) => (value: string) => {
  const date = new Date(value);
  return !isNaN(date.getTime()) && date.getTime() > Date.now() - graceMs;
};

export const orderFormSchema = z.object({
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
    .refine(createIsFutureDate(START_TIME_GRACE_PERIOD_MS), {
      error: "Delivery Window Start must be in the future",
    }),
  deliveryWindowEnd: z
    .string()
    .min(1, { error: "Delivery Window End is required" })
    .refine(createIsFutureDate(), {
      error: "Delivery Window End must be in the future",
    }),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;
