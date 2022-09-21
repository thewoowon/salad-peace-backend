import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'name', // 이름
  'email', // 이메일
  'password', // 비밀번호
  'role', // 역할
]) {}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {}
