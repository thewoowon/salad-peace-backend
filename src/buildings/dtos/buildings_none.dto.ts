import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Building } from '../entities/building.entity';

@InputType()
export class BuildingsNoneInput {}

@ObjectType()
export class BuildingsNoneOutput extends CoreOutput {
  @Field((type) => [Building], { nullable: true })
  results?: Building[];

  @Field((type) => Number)
  count?: number;
}
