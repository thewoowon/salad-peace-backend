import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Building } from '../entities/building.entity';

@InputType()
export class BuildingsInput extends PaginationInput {}

@ObjectType()
export class BuildingsOutput extends PaginationOutput {
  @Field((type) => [Building], { nullable: true })
  results?: Building[];
}
