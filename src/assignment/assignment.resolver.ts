import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { CreateBuildingOutput } from 'src/buildings/dtos/create-building.dto';
import { User } from 'src/users/entities/user.entity';
import { AssignmentService } from './assignment.service';
import {
  CreateAssignmentInput,
  CreateAssignmentOutput,
} from './dtos/create-assignment.dto';
import { Assignment } from './entitles/assignment.entity';

@Resolver((of) => Assignment)
export class AssignmentResolver {
  constructor(private readonly assignmentService: AssignmentService) {}
  @Mutation((returns) => CreateAssignmentOutput)
  @Role(['Master'])
  async createAssignment(
    @AuthUser() authUser: User,
    @Args('input') createAssignmentInput: CreateAssignmentInput,
  ): Promise<CreateAssignmentOutput> {
    return this.assignmentService.createAssignment(
      authUser,
      createAssignmentInput,
    );
  }
}
