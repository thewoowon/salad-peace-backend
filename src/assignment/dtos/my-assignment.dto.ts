import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Assignment } from '../entitles/assignment.entity';

@InputType()
export class MyAssignmentInput extends PickType(Assignment, ['id']) {}

@ObjectType()
export class MyAssignmentOutput extends CoreOutput {
  @Field((type) => Assignment, { nullable: true })
  assignment?: Assignment;
}
