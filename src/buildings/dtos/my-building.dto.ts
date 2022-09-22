import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Building } from '../entities/building.entity';

@InputType()
export class MyBuildingInput extends PickType(Building, ['id']) {}

@ObjectType()
export class MyBuildingOutput extends CoreOutput {
  @Field((type) => Building, { nullable: true })
  building?: Building;
}
