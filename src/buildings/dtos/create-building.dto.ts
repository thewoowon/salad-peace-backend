import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';

@ArgsType()
export class CreateBuildingInput {
  @Field((type) => String)
  @IsString()
  name: string;

  @Field((type) => Boolean)
  @IsBoolean()
  isBuilding: boolean;
}
