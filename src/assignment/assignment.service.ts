import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAssignmentInput,
  CreateAssignmentOutput,
} from './dtos/create-assignment.dto';
import { Assignment } from './entitles/assignment.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import {
  MyAssignmentsInput,
  MyAssignmentsOutput,
} from './dtos/my-assignments.dto';
import {
  MyAssignmentInput,
  MyAssignmentOutput,
} from './dtos/my-assignment.dto';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignment: Repository<Assignment>,
  ) {}

  async createAssignment(
    user: User,
    createAssignmentInput: CreateAssignmentInput,
  ): Promise<CreateAssignmentOutput> {
    try {
      const newAssignment = this.assignment.create(createAssignmentInput);
      await this.assignment.save(newAssignment);
      return {
        ok: true,
        assignmentId: newAssignment.id,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not create Assignment',
        assignmentId: null,
      };
    }
  }

  async myAssignments(
    user: User,
    myAssignmentsInput: MyAssignmentsInput,
  ): Promise<MyAssignmentsOutput> {
    try {
      const assignments = await this.assignment.find({
        where: {
          manager: {
            id: user.id,
          },
        },
      });
      return {
        ok: true,
        assignments: assignments,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not find Assignments',
      };
    }
  }

  async myAssignment(
    user: User,
    myAssignmentInput: MyAssignmentInput,
  ): Promise<MyAssignmentOutput> {
    try {
      const assignment = await this.assignment.findOne({
        where: {
          manager: {
            id: user.id,
          },
        },
      });
      return {
        ok: true,
        assignment: assignment,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not find Assignment',
      };
    }
  }
}
