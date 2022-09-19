import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Building {
  @Field((type) => String)
  name: string;
  @Field((type) => Boolean, { nullable: true })
  isBuilding: boolean;
}
