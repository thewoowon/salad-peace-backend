import {
  Field,
  InputType,
  Int,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Building } from '../entities/building.entity';

@InputType()
export class CreateBuildingInput extends PickType(Building, [
  'name',
  'address',
  'permanentWorker',
  'buildingCode',
]) {
  @Field((type) => String)
  categoryName: string;
}

@ObjectType()
export class CreateBuildingOutput extends CoreOutput {
  @Field((type) => Int)
  buildingId: number;
}
