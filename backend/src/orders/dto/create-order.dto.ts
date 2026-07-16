import {
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

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
  deliveryWindowStart!: string;

  @IsISO8601()
  deliveryWindowEnd!: string;
}
