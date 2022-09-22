import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Building } from '../entities/building.entity';

@InputType()
export class SearchBuildingInput extends PaginationInput {
  @Field((type) => String)
  query: string;
}

@ObjectType()
export class SearchBuildingOutput extends PaginationOutput {
  @Field((type) => [Building], { nullable: true })
  buildings?: Building[];
}
