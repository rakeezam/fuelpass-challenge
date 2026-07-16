import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

// Single source of truth for legal status transitions: PENDING -> CONFIRMED -> COMPLETED, never backwards.
const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED],
  [OrderStatus.CONFIRMED]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: EntityRepository<Order>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.ordersRepository.create({
      tailNumber: dto.tailNumber,
      airportIcaoCode: dto.airportIcaoCode,
      requestedFuelVolume: dto.requestedFuelVolume,
      deliveryWindowStart: new Date(dto.deliveryWindowStart),
      deliveryWindowEnd: new Date(dto.deliveryWindowEnd),
    });

    await this.ordersRepository.getEntityManager().flush();

    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.findAll({ orderBy: { createdAt: 'DESC' } });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.ordersRepository.findOne({ id });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[order.status];

    if (!allowedNextStatuses.includes(status)) {
      const allowed =
        allowedNextStatuses.length > 0
          ? `Allowed next status: ${allowedNextStatuses.join(', ')}.`
          : `${order.status} is a final status; no further transitions are allowed.`;

      throw new BadRequestException(
        `Cannot transition order from ${order.status} to ${status}. ${allowed}`,
      );
    }

    order.status = status;
    await this.ordersRepository.getEntityManager().flush();

    return order;
  }
}
