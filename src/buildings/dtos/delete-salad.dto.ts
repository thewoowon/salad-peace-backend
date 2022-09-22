import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteSaladInput {
  @Field((type) => Int)
  saladId: number;
}

@ObjectType()
export class DeleteSaladOutput extends CoreOutput {}
