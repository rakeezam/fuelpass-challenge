import {
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Prevents "now" getting rejected
const START_TIME_GRACE_PERIOD_MS = 5 * 60 * 1000;

const isFutureDate = (value: unknown, graceMs: number): boolean => {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime()) && date.getTime() > Date.now() - graceMs;
};

const IsFutureDate = (options?: ValidationOptions & { graceMs?: number }) => {
  const { graceMs = 0, ...validationOptions } = options ?? {};

  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) => isFutureDate(value, graceMs),
        defaultMessage: () => `${propertyName} must be a date in the future`,
      },
    });
  };
};

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  tailNumber!: string;

  @Transform(({ value }: { value: string }) => value?.toUpperCase())
  @Matches(/^[A-Z]{4}$/, {
    message: 'airportIcaoCode must be exactly 4 letters (e.g. KJFK or kjfk)',
  })
  airportIcaoCode!: string;

  @IsNumber()
  @IsPositive()
  requestedFuelVolume!: number;

  @IsISO8601()
  @IsFutureDate({
    message: 'deliveryWindowStart must be in the future',
    graceMs: START_TIME_GRACE_PERIOD_MS,
  })
  deliveryWindowStart!: string;

  @IsISO8601()
  @IsFutureDate({ message: 'deliveryWindowEnd must be in the future' })
  deliveryWindowEnd!: string;
}
