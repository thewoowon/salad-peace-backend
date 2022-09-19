import { Module } from '@nestjs/common';
import { BuildingResolver } from './buildings.resolver';

@Module({
  providers: [BuildingResolver],
})
export class BuildingsModule {}
