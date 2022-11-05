import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Salad } from 'src/buildings/entities/salad.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order } from '../entities/order.entity';

@InputType()
export class GetOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class GetOrderOutput extends CoreOutput {
  @Field((type) => Order, { nullable: true })
  order?: Order;

  @Field((type) => [Salad], { nullable: true })
  salads?: Salad[];
}
