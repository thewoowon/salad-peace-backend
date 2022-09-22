import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Building } from '../entities/building.entity';

@InputType()
export class BuildingInput {
  @Field((type) => Int)
  buildingId: number;
}

@ObjectType()
export class BuildingOutput extends CoreOutput {
  @Field((type) => Building, { nullable: true })
  building?: Building;
}
