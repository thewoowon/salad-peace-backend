import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteBuildingInput {
  @Field((type) => Number)
  buildingId: number;
}

@ObjectType()
export class DeleteBuildingOutput extends CoreOutput {}
