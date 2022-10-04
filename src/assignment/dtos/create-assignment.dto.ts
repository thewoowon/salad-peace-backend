import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Assignment } from '../entitles/assignment.entity';

@InputType()
export class CreateAssignmentInput extends PickType(Assignment, [
  'name',
  'manager',
  'total',
  'building',
  'salad',
]) {}

@ObjectType()
export class CreateAssignmentOutput extends CoreOutput {
  @Field((type) => Assignment, { nullable: true })
  assignmentId?: number;
}
