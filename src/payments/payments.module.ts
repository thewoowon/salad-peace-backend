import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Building } from 'src/buildings/entities/building.entity';
import { Payment } from './entities/payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentResolver } from './payments.resolver';
import { PaymentService } from './payments.service';

@Module({
  controllers: [PaymentsController],
  imports: [TypeOrmModule.forFeature([Payment, Building])],
  providers: [PaymentResolver, PaymentService],
})
export class PaymentsModule {}
