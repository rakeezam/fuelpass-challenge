import { IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateStatusDto {
  @IsEnum(OrderStatus, {
    message: 'status must be one of PENDING, CONFIRMED, or COMPLETED',
  })
  status!: OrderStatus;
}
