import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

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
}
