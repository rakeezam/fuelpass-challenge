import {
  Entity,
  Enum,
  PrimaryKey,
  Property,
} from '@mikro-orm/decorators/legacy';
import { v7 as uuidv7 } from 'uuid';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
}

// 'order' is a reserved SQL keyword (as in ORDER BY), so the table is named 'orders'.
@Entity({ tableName: 'orders' })
export class Order {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv7();

  @Property({ type: 'string' })
  tailNumber!: string;

  @Property({ type: 'string' })
  airportIcaoCode!: string;

  @Property({ type: 'double' })
  requestedFuelVolume!: number;

  @Property({ type: 'datetime', columnType: 'timestamptz' })
  deliveryWindowStart!: Date;

  @Property({ type: 'datetime', columnType: 'timestamptz' })
  deliveryWindowEnd!: Date;

  @Enum(() => OrderStatus)
  status: OrderStatus = OrderStatus.PENDING;

  @Property({
    type: 'datetime',
    columnType: 'timestamptz',
    onCreate: () => new Date(),
  })
  createdAt!: Date;
}
