import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Salad } from '../entities/salad.entity';

@InputType()
export class CreateSaladInput extends PickType(Salad, [
  'name',
  'price',
  'description',
  'options',
]) {
  @Field((type) => Int)
  buildingId: number;
}

@ObjectType()
export class CreateSaladOutput extends CoreOutput {}
