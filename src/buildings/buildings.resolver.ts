import { Args, Mutation, Query } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { CreateBuildingInput } from './dtos/create-building.dto';
import { Building } from './entities/building.entity';

@Resolver((of) => Building)
export class BuildingResolver {
  @Query(() => Boolean)
  isBuilding() {
    return true;
  }
  @Query(() => Building)
  allBuiling() {
    return {
      name: 'test',
    };
  }
  @Mutation(() => Boolean)
  createBuilding(@Args() createBuildingInput: CreateBuildingInput): boolean {
    return true;
  }
}
