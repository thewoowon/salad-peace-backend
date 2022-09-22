import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmExModule } from 'src/database/typeorm-ex.module';
import { Category } from './entities/category.entity';
import { Salad } from './entities/salad.entity';
import { Building } from './entities/building.entity';
import { CategoryRepository } from './repositories/category.repository';
import {
  CategoryResolver,
  SaladResolver,
  BuildingResolver,
} from './buildings.resolver';
import { BuildingService } from './buildings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Building, Salad]),
    TypeOrmExModule.forCustomRepository([CategoryRepository]),
  ],
  controllers: [],
  providers: [
    BuildingResolver,
    CategoryResolver,
    SaladResolver,
    BuildingService,
  ],
})
export class BuildingsModule {}
