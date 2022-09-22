import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Building } from '../entities/building.entity';

@ObjectType()
export class MyBuildingsOutput extends CoreOutput {
  @Field((type) => [Building])
  buildings?: Building[];
}
