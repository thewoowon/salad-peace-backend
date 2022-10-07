import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Salad } from 'src/buildings/entities/salad.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field((type) => String)
  name: string;

  @Field((type) => String, { nullable: true })
  choice: string;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @Field((type) => Salad)
  @ManyToOne((type) => Salad, { nullable: true, onDelete: 'CASCADE' })
  salad: Salad;

  @Field((type) => Int)
  @Column({ nullable: true })
  quantity: number;

  // @Field((type) => [OrderItemOption], { nullable: true })
  // @Column({ type: 'json', nullable: true })
  // options: OrderItemOption[];
}
