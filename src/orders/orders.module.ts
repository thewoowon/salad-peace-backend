import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Building } from 'src/buildings/entities/building.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderResolver } from './orders.resolver';
import { OrderService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Building, OrderItem])],
  providers: [OrderService, OrderResolver],
})
export class OrdersModule {}
