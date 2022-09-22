import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Salad } from '../entities/salad.entity';

@InputType()
export class EditSaladInput extends PickType(PartialType(Salad), [
  'name',
  'options',
  'price',
  'description',
]) {
  @Field((type) => Int)
  saladId: number;
}

@ObjectType()
export class EditSaladOutput extends CoreOutput {}
