import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Assignment } from '../entitles/assignment.entity';

@InputType()
export class MyAssignmentsInput extends PickType(Assignment, ['id']) {}

@ObjectType()
export class MyAssignmentsOutput extends CoreOutput {
  @Field((type) => [Assignment], { nullable: true })
  assignments?: Assignment[];
}
