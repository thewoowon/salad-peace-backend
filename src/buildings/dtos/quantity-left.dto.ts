import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Building } from '../entities/building.entity';

@InputType()
export class QuantityLeftInput extends PickType(Building, ['id']) {}

@ObjectType()
export class QuantityLeftOutput extends CoreOutput {
  @Field((type) => Int, { nullable: true })
  quantity?: number;
}
