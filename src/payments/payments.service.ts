import { Injectable } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';
import { Cron, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { Building } from 'src/buildings/entities/building.entity';
import { User } from 'src/users/entities/user.entity';
import { LessThan, Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Building)
    private readonly buildings: Repository<Building>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}
  async createPayment(
    user: User,
    { transactionId, buildingId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const building = await this.buildings.findOne({
        where: {
          id: buildingId,
        },
      });
      if (!building) {
        return {
          ok: false,
          error: 'Building is not Found',
        };
      }
      await this.payments.save(
        this.payments.create({
          transactionId: transactionId,
          user: user,
          building: building,
        }),
      );
      building.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      building.promotedUntil = date;
      this.buildings.save(building);
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'You Could not create payment',
      };
    }
  }

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({
        where: {
          userId: user.id,
        },
      });
      return {
        ok: true,
        payments: payments,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not load Payments.',
      };
    }
  }

  @Interval(2000)
  async checkPromotedBuildings() {
    const buildings = await this.buildings.find({
      where: {
        isPromoted: true,
        promotedUntil: LessThan(new Date()),
      },
    });
    buildings.forEach(async (restaurant) => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.buildings.save(restaurant);
    });
  }
}
