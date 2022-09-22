import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Like, RelationId, Repository } from 'typeorm';
import { Building } from './entities/building.entity';
import {
  CreateBuildingInput,
  CreateBuildingOutput,
} from './dtos/create-building.dto';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';
import {
  EditBuildingInput,
  EditBuildingOutput,
} from './dtos/edit-building.dto';
import { CategoryRepository } from './repositories/category.repository';
import {
  DeleteBuildingInput,
  DeleteBuildingOutput,
} from './dtos/delete-building.dto';
import { AllCategoriesOuput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import {
  SearchBuildingInput,
  SearchBuildingOutput,
} from './dtos/search-building.dto';
import { BuildingInput, BuildingOutput } from './dtos/building.dto';
import { BuildingsInput, BuildingsOutput } from './dtos/buildings.dto';
import { CreateSaladInput, CreateSaladOutput } from './dtos/create-salad.sto';
import { create } from 'domain';
import { Salad } from './entities/salad.entity';
import { EditSaladInput, EditSaladOutput } from './dtos/edit-salad.dto';
import { DeleteSaladInput, DeleteSaladOutput } from './dtos/delete-salad.dto';
import { MyBuildingsOutput } from './dtos/my-buildings.dto';
import { MyBuildingInput, MyBuildingOutput } from './dtos/my-building.dto';

@Injectable()
export class BuildingService {
  constructor(
    @InjectRepository(Building)
    private readonly buildings: Repository<Building>,
    @InjectRepository(Salad)
    private readonly salads: Repository<Salad>,
    private readonly categories: CategoryRepository,
  ) {}

  async createBuilding(
    user: User,
    createBuildingInput: CreateBuildingInput,
  ): Promise<CreateBuildingOutput> {
    try {
      const newBuilding = this.buildings.create(createBuildingInput);
      const category = await this.categories.getOrCreate(
        createBuildingInput.categoryName,
      );
      newBuilding.category = category;
      await this.buildings.save(newBuilding);
      return {
        ok: true,
        buildingId: newBuilding.id,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not create Building',
        buildingId: null,
      };
    }
  }

  async editBuilding(
    user: User,
    editBuildingInput: EditBuildingInput,
  ): Promise<EditBuildingOutput> {
    try {
      const building = await this.buildings.findOne({
        where: { id: editBuildingInput.buildId },
        loadRelationIds: true,
      });
      if (!building) {
        return {
          ok: false,
          error: 'Building not Found',
        };
      }
      if (user.role !== UserRole.Master) {
        return {
          ok: false,
          error: "Yout can't edit a Building that you don't own",
        };
      }
      let category: Category = null;
      if (editBuildingInput.categoryName) {
        category = await this.categories.getOrCreate(
          editBuildingInput.categoryName,
        );
      }
      await this.buildings.save([
        {
          id: editBuildingInput.buildId,
          ...editBuildingInput,
          ...(category && { category: category }),
        },
      ]);

      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  async deleteBuilding(
    user: User,
    deleteBuildingInput: DeleteBuildingInput,
  ): Promise<DeleteBuildingOutput> {
    try {
      const building = await this.buildings.findOne({
        where: { id: deleteBuildingInput.buildingId },
      });
      if (!building) {
        return {
          ok: false,
          error: 'Building not Found',
        };
      }
      if (user.role !== UserRole.Master) {
        return {
          ok: false,
          error: "Yout can't edit a Building that you don't own",
        };
      }
      await this.buildings.delete({ id: deleteBuildingInput.buildingId });
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOuput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories: categories,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not load categories',
      };
    }
  }

  countBuildings(category: Category) {
    return this.buildings.count({
      where: {
        category: {
          id: category.id,
        },
      },
    });
  }
  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({
        where: {
          slug: slug,
        },
      });
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }
      const buildings = await this.buildings.find({
        where: {
          category: {
            id: category.id,
          },
        },
        take: 25,
        skip: (page - 1) * 25,
        order: {
          isPromoted: 'DESC',
        },
      });
      const totalResults = await this.countBuildings(category);
      return {
        ok: true,
        buildings: buildings,
        category: category,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  async allBuildings({ page }: BuildingsInput): Promise<BuildingsOutput> {
    try {
      const [buildings, totalResults] = await this.buildings.findAndCount({
        skip: (page - 1) * 25,
        take: 25,
        order: {
          isPromoted: 'DESC',
        },
      });
      return {
        ok: true,
        results: buildings,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load Buildings',
      };
    }
  }

  async findBuildingById({
    buildingId,
  }: BuildingInput): Promise<BuildingOutput> {
    try {
      const building = await this.buildings.findOne({
        where: {
          id: buildingId,
        },
        relations: ['menu'],
      });
      if (!building) {
        return {
          ok: false,
          error: 'Building not found',
        };
      }
      return {
        ok: true,
        building: building,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not find Building',
      };
    }
  }

  async searchBuildingByName({
    query,
    page,
  }: SearchBuildingInput): Promise<SearchBuildingOutput> {
    try {
      const [buildings, totalResults] = await this.buildings.findAndCount({
        where: {
          name: ILike(`%${query}%`),
        },
        skip: (page - 1) * 25,
        take: 25,
      });
      return {
        ok: true,
        buildings: buildings,
        totalResults: totalResults,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not Search for Buildings',
      };
    }
  }

  async createSalad(
    user: User,
    createSaladInput: CreateSaladInput,
  ): Promise<CreateSaladOutput> {
    try {
      const building = await this.buildings.findOne({
        where: {
          id: createSaladInput.buildingId,
        },
      });
      if (!building) {
        return {
          ok: false,
          error: 'Building not Found',
        };
      }
      if (user.role !== UserRole.Master) {
        return {
          ok: false,
          error: "You can't do that",
        };
      }
      const salad = await this.salads.save(
        this.salads.create({
          ...createSaladInput,
          building,
        }),
      );
      return {
        ok: true,
        error: '',
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not create Salad',
      };
    }
  }

  async checkSaladMaster(userId: number, saladId: number) {
    return null;
  }

  async myBuildings(user: User): Promise<MyBuildingsOutput> {
    try {
      const buildings = await this.buildings.find({
        where: {
          users: {
            id: user.id,
          },
        },
        relations: ['category'],
      });
      return {
        buildings: buildings,
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not find Buildings.',
      };
    }
  }

  async myBuilding(
    user: User,
    { id }: MyBuildingInput,
  ): Promise<MyBuildingOutput> {
    try {
      const building = await this.buildings.findOne({
        where: {
          id: id,
        },
        relations: ['category', 'menu', 'orders'],
      });
      if (!building) {
        return {
          ok: false,
          error: 'Building not Found',
        };
      }
      return {
        building: building,
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not find Building.',
      };
    }
  }

  async editSalad(
    user: User,
    editSaladInput: EditSaladInput,
  ): Promise<EditSaladOutput> {
    try {
      const salad = await this.salads.findOne({
        where: {
          id: editSaladInput.saladId,
        },
        relations: ['building'],
      });
      if (!salad) {
        return {
          ok: false,
          error: 'Salad not Found',
        };
      }
      if (user.role !== UserRole.Master) {
        return {
          ok: false,
          error: "You can't do that",
        };
      }
      await this.salads.save([
        {
          id: editSaladInput.saladId,
          ...editSaladInput,
        },
      ]);
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not delete Salad',
      };
    }
  }

  async deleteSalad(
    user: User,
    { saladId }: DeleteSaladInput,
  ): Promise<DeleteSaladOutput> {
    try {
      const salad = await this.salads.findOne({
        where: {
          id: saladId,
        },
        relations: ['building'],
      });
      if (!salad) {
        return {
          ok: false,
          error: 'Salad not Found',
        };
      }
      if (user.role !== UserRole.Master) {
        return {
          ok: false,
          error: "You can't do that",
        };
      }
      await this.salads.delete(saladId);
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not delete Salad',
      };
    }
  }
}