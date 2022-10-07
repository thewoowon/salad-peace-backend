import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Building } from './entities/building.entity';
import {
  CreateBuildingInput,
  CreateBuildingOutput,
} from './dtos/create-building.dto';
import { BuildingService } from './buildings.service';
import { User, UserRole } from 'src/users/entities/user.entity';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/auth/role.decorator';
import { EditProfileOutput } from 'src/users/dtos/edit-profile.dto';
import { setMaxListeners } from 'process';
import {
  EditBuildingInput,
  EditBuildingOutput,
} from './dtos/edit-building.dto';
import {
  DeleteBuildingInput,
  DeleteBuildingOutput,
} from './dtos/delete-building.dto';
import { Category } from './entities/category.entity';
import { AllCategoriesOuput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import {
  SearchBuildingInput,
  SearchBuildingOutput,
} from './dtos/search-building.dto';
import { BuildingInput, BuildingOutput } from './dtos/building.dto';
import { BuildingsInput, BuildingsOutput } from './dtos/buildings.dto';
import { Salad } from './entities/salad.entity';
import { CreateAccountOutput } from 'src/users/dtos/create-account.dto';
import { CreateSaladInput, CreateSaladOutput } from './dtos/create-salad.dto';
import { EditSaladInput, EditSaladOutput } from './dtos/edit-salad.dto';
import { DeleteSaladInput, DeleteSaladOutput } from './dtos/delete-salad.dto';
import { MyBuildingsOutput } from './dtos/my-buildings.dto';
import { MyBuildingInput, MyBuildingOutput } from './dtos/my-building.dto';
import {
  QuantityLeftInput,
  QuantityLeftOutput,
} from './dtos/quantity-left.dto';

@Resolver((of) => Building)
export class BuildingResolver {
  constructor(private readonly buildingService: BuildingService) {}
  @Mutation((returns) => CreateBuildingOutput)
  @Role(['Master'])
  async createBuilding(
    @AuthUser() authUser: User,
    @Args('input') createBuildingInput: CreateBuildingInput,
  ): Promise<CreateBuildingOutput> {
    return this.buildingService.createBuilding(authUser, createBuildingInput);
  }

  @Query((returns) => MyBuildingsOutput)
  @Role(['Master'])
  async myBuildings(@AuthUser() master: User): Promise<MyBuildingsOutput> {
    return await this.buildingService.myBuildings(master);
  }

  @Query((returns) => MyBuildingsOutput)
  @Role(['Master', 'Manager'])
  async myAreaBuildings(@AuthUser() manager: User): Promise<MyBuildingsOutput> {
    return await this.buildingService.myAreaBuildings(manager);
  }

  @Query((returns) => MyBuildingOutput)
  @Role(['Master', 'Manager', 'Client'])
  myBuilding(
    @AuthUser() master: User,
    @Args('input') myBuildingInput: MyBuildingInput,
  ): Promise<MyBuildingOutput> {
    return this.buildingService.myBuilding(master, myBuildingInput);
  }

  @Query((returns) => MyBuildingOutput)
  @Role(['Master', 'Manager'])
  myAreaBuilding(
    @AuthUser() manager: User,
    @Args('input') myBuildingInput: MyBuildingInput,
  ): Promise<MyBuildingOutput> {
    return this.buildingService.myAreaBuilding(manager, myBuildingInput);
  }

  @Mutation((returns) => EditProfileOutput)
  @Role(['Master'])
  async editBuilding(
    @AuthUser() master: User,
    @Args('input') editBuildingInput: EditBuildingInput,
  ): Promise<EditBuildingOutput> {
    return await this.buildingService.editBuilding(master, editBuildingInput);
  }

  @Mutation((returns) => EditProfileOutput)
  @Role(['Master'])
  async deleteBuilding(
    @AuthUser() master: User,
    @Args('input') deleteBuildingInput: DeleteBuildingInput,
  ): Promise<DeleteBuildingOutput> {
    return this.buildingService.deleteBuilding(master, deleteBuildingInput);
  }

  @Query((returns) => BuildingsOutput)
  buildings(
    @Args('input') buildingsInput: BuildingsInput,
  ): Promise<BuildingsOutput> {
    return this.buildingService.allBuildings(buildingsInput);
  }

  @Query((returns) => BuildingOutput)
  building(
    @Args('input') buildingInput: BuildingInput,
  ): Promise<BuildingOutput> {
    return this.buildingService.findBuildingById(buildingInput);
  }

  @Query((returns) => SearchBuildingOutput)
  searchBuilding(
    @Args('input') searchBuildingInput: SearchBuildingInput,
  ): Promise<SearchBuildingOutput> {
    return this.buildingService.searchBuildingByName(searchBuildingInput);
  }

  @Query((returns) => QuantityLeftOutput)
  @Role(['Any'])
  quantity(
    @AuthUser() authUser: User,
    @Args('input') quantityLeftInput: QuantityLeftInput,
  ): Promise<QuantityLeftOutput> {
    return this.buildingService.getQuantityLeft(quantityLeftInput);
  }
}

@Resolver((of) => Category)
export class CategoryResolver {
  constructor(private readonly buildingService: BuildingService) {}

  @ResolveField((type) => Number)
  buildingCount(@Parent() category: Category): Promise<number> {
    return this.buildingService.countBuildings(category);
  }

  @Query((type) => AllCategoriesOuput)
  allCategories(): Promise<AllCategoriesOuput> {
    return this.buildingService.allCategories();
  }

  @Query((type) => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.buildingService.findCategoryBySlug(categoryInput);
  }
}

@Resolver((of) => Salad)
export class SaladResolver {
  constructor(private readonly buildingService: BuildingService) {}

  @Mutation((type) => CreateAccountOutput)
  @Role(['Master'])
  createSalad(
    @AuthUser() master: User,
    @Args('input') createSaladInput: CreateSaladInput,
  ): Promise<CreateSaladOutput> {
    return this.buildingService.createSalad(master, createSaladInput);
  }

  @Mutation((type) => EditSaladOutput)
  @Role(['Master'])
  editSalad(
    @AuthUser() master: User,
    @Args('input') editSaladInput: EditSaladInput,
  ): Promise<EditSaladOutput> {
    return this.buildingService.editSalad(master, editSaladInput);
  }

  @Mutation((type) => DeleteSaladOutput)
  @Role(['Master'])
  deleteSalad(
    @AuthUser() master: User,
    @Args('input') deleteSaladInput: DeleteSaladInput,
  ): Promise<DeleteSaladOutput> {
    return this.buildingService.deleteSalad(master, deleteSaladInput);
  }
}
