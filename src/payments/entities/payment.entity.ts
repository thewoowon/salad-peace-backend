import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Building } from 'src/buildings/entities/building.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@InputType('PaymentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
  @Field((type) => String)
  @Column()
  transactionId: string;

  @Field((type) => User, { nullable: true })
  @ManyToOne(
    // 내가 다중 대상이 하나, 나는 주문 대상은 주문자
    (type) => User,
    (user) => user.payments,
  )
  user?: User;

  @RelationId((payment: Payment) => payment.user)
  userId: number;

  @Field((type) => Building)
  @ManyToOne((type) => Building)
  building: Building;

  @RelationId((payment: Payment) => payment.building)
  @Field((type) => Int)
  buildingId: number;
}
