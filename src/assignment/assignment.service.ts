import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAssignmentInput,
  CreateAssignmentOutput,
} from './dtos/create-assignment.dto';
import { Assignment } from './entitles/assignment.entity';
import { User, UserRole } from 'src/users/entities/user.entity';

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
}
