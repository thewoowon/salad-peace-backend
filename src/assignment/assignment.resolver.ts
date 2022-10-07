import { Args, Mutation, Resolver, Query, Subscription } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { CreateBuildingOutput } from 'src/buildings/dtos/create-building.dto';
import { User } from 'src/users/entities/user.entity';
import { AssignmentService } from './assignment.service';
import {
  CreateAssignmentInput,
  CreateAssignmentOutput,
} from './dtos/create-assignment.dto';
import {
  MyAssignmentInput,
  MyAssignmentOutput,
} from './dtos/my-assignment.dto';
import {
  MyAssignmentsInput,
  MyAssignmentsOutput,
} from './dtos/my-assignments.dto';
import { Assignment } from './entitles/assignment.entity';
import { PubSub } from 'graphql-subscriptions';
import {
  NEW_READY_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constants';
import { Inject } from '@nestjs/common';

@Resolver((of) => Assignment)
export class AssignmentResolver {
  constructor(
    private readonly assignmentService: AssignmentService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

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

  @Query((returns) => MyAssignmentsOutput)
  @Role(['Master', 'Manager', 'Client'])
  async myAssignments(
    @AuthUser() authUser: User,
    @Args('input') myAssignmentsInput: MyAssignmentsInput,
  ): Promise<MyAssignmentsOutput> {
    return this.assignmentService.myAssignments(authUser, myAssignmentsInput);
  }

  @Query((returns) => MyAssignmentOutput)
  @Role(['Master', 'Manager', 'Client'])
  async myAssignment(
    @AuthUser() authUser: User,
    @Args('input') myAssignmentInput: MyAssignmentInput,
  ): Promise<MyAssignmentOutput> {
    return this.assignmentService.myAssignment(authUser, myAssignmentInput);
  }

  @Subscription((returns) => Assignment, {
    filter: (payload, _, context) => {
      return true;
    },
    resolve: ({ pendingOrders: { order } }) => order,
  })
  @Role(['Manager', 'Master'])
  pendingOrders() {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }
}
