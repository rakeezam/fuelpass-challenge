import {
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  tailNumber!: string;

  @Matches(/^[A-Z]{4}$/, {
    message: 'airportIcaoCode must be exactly 4 uppercase letters (e.g. KJFK)',
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
