import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { CreateBuildingInput } from './create-building.dto';

@InputType()
export class EditBuildingInput extends PartialType(CreateBuildingInput) {
  @Field((type) => Number)
  buildId: number;
}

@ObjectType()
export class EditBuildingOutput extends CoreOutput {}
