import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { stat } from 'fs';
import { PubSub } from 'graphql-subscriptions';
import {
  NEW_READY_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constants';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { Building } from 'src/buildings/entities/building.entity';
import { Salad } from 'src/buildings/entities/salad.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Building)
    private readonly buildings: Repository<Building>,
    @InjectRepository(Salad)
    private readonly salads: Repository<Salad>,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async createOrder(
    customer: User,
    { items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const building = await this.buildings.findOne({
        where: {
          id: customer.buildingId,
        },
      });
      if (!building) {
        return {
          ok: false,
          error: 'Building no Found',
        };
      }
      let orderFinalPrice = 0;
      let orderFinalQuantity = 0;
      const orderItems: OrderItem[] = [];
      // 단일 품목이므로 길이는 1
      for (const item of items) {
        // items는 배열 객체
        // item은 배열 객체의 요소 -> CreateOrderItemInput -> saladId, options?[]
        const salad = await this.salads.findOne({
          where: {
            id: item.saladId,
          },
        });
        if (!salad) {
          return {
            ok: false,
            error: 'Salad not found.',
          };
        }
        const saladFinalQuantity = item.quantity;
        const saladFinalPrice = salad.price * item.quantity;
        orderFinalPrice = orderFinalPrice + saladFinalPrice;
        orderFinalQuantity = orderFinalQuantity + saladFinalQuantity;
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            salad,
            quantity: item.quantity,
          }),
        );
        orderItems.push(orderItem);
      }
      const order = await this.orders.save(
        this.orders.create({
          customer: customer,
          building: building,
          total: orderFinalPrice,
          quantity: orderFinalQuantity,
          items: orderItems,
        }),
      );
      await this.pubSub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order, builingId: building.id },
      });
      return {
        ok: true,
        orderId: order.id,
      };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'Could not create order.',
      };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      // 실제 고객일 때,
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: {
              id: user.id,
            },
            ...(status && { status: status }), // status가 있을 때만 status를 넣어준다.
          },
        });
        // 배송기사 일 때,
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: {
            driver: {
              id: user.id,
            },
            ...(status && { status }), // status가 있을 때만 status를 넣어준다.
          },
        });
        // 운영자일 때, 모든 주문 내역을 가져온다.
      } else if (user.role === UserRole.Master) {
        const buildings = await this.buildings.find({
          relations: ['orders'],
        });
        orders = buildings.map((building) => building.orders).flat(1);
      }
      return {
        ok: true,
        orders: orders,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not Get Orders',
      };
    }
  }
  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: {
          id: orderId,
        },
        relations: ['restaurant'],
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found.',
        };
      }

      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: 'You cant see that',
        };
      }
      return {
        ok: true,
        order,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load order.',
      };
    }
  }

  canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      canSee = false;
    }
    return canSee;
  }

  async editOrder(
    // 이건 주문 상태 변경을 위함
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: {
          id: orderId,
        },
      });

      if (!order) {
        return {
          ok: false,
          error: 'Order not Found',
        };
      }

      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: 'You cant see that',
        };
      }
      // 주문 수정
      let canEdit = true;
      if (user.role === UserRole.Client) {
        if (
          status === OrderStatus.PickedUp ||
          status === OrderStatus.Delivered
        ) {
          canEdit = false;
        }
      } // 선착순 판매 시스템이므로 고객은 남아 있는 개수만 큼 수량을 수정 가능
      if (user.role === UserRole.Delivery) {
        if (status === OrderStatus.Pending) {
          canEdit = false;
        }
      }

      if (!canEdit) {
        return {
          ok: false,
          error: "You can't do that",
        };
      }

      await this.orders.save({
        id: orderId,
        status,
      });
      // 유일한 오더 그리고 변경할 상태
      const newOrder = { ...order, status };
      if (user.role === UserRole.Master) {
        // 운영자이고
        if (status === OrderStatus.Pending) {
          // 만약 대기 중이라면
          await this.pubSub.publish(NEW_READY_ORDER, {
            // 출발 준비된 주문을 발행
            readyOrders: newOrder,
          });
        }
      }
      await this.pubSub.publish(NEW_ORDER_UPDATE, {
        orderUpdates: newOrder,
      });
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not edit Order.',
      };
    }
  }

  async takeOrder(
    driver: User,
    { id: orderId }: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: {
          id: orderId,
        },
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not Found',
        };
      }
      if (order.driver) {
        return {
          ok: false,
          error: 'This order already has a driver',
        };
      }
      await this.orders.save({
        id: orderId,
        driver: driver,
      });
      await this.pubSub.publish(NEW_ORDER_UPDATE, {
        orderUpdates: { ...order, driver },
      });
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not update order',
      };
      return;
    }
  }
}
