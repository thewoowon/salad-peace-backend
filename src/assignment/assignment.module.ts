import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentResolver } from './assignment.resolver';
import { AssignmentService } from './assignment.service';
import { Assignment } from './entitles/assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assignment])],
  providers: [AssignmentService, AssignmentResolver],
})
export class AssignmentModule {}
