import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { Building } from 'src/buildings/entities/building.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Assignment } from '../entitles/assignment.entity';

@InputType()
export class MyAssignmentsInput extends PickType(Building, ['id']) {}

@ObjectType()
export class MyAssignmentsOutput extends CoreOutput {
  @Field((type) => [Assignment], { nullable: true })
  assignments?: Assignment[];
}
