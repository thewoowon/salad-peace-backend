import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UseProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { Role } from 'src/auth/role.decorator';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // Query -> 모든 사용자 조회
  @Query((returns) => [User])
  users(): Promise<User[]> {
    return this.usersService.usersAll();
  }
  // Mutation -> 사용자 생성
  @Mutation((returns) => CreateAccountOutput)
  async createAccount(
    @Args('buildingCode') buildingCode: string,
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(buildingCode, createAccountInput);
  }
  // Mutation -> 사용자 로그인
  @Mutation((returns) => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }
  // Query -> 모든 역할이 포함되고 현재 AuthUser인 사용자 정보 조회
  @Query((returns) => User)
  @Role(['Any'])
  me(@AuthUser() authUser: User) {
    return authUser;
  }
  // Query -> 모든 역할이 포함되고 Id와 일치하는 사용자 정보 조회
  @Query((returns) => UserProfileOutput)
  @Role(['Any'])
  async userProfile(
    @Args() userProfileInput: UseProfileInput,
  ): Promise<UserProfileOutput> {
    return await this.usersService.findById(userProfileInput.userId);
  }
  // Mutation -> 모든 역할이 포함되고 현재 AuthUser인 사용자 정보를 수정
  @Mutation((returns) => EditProfileOutput)
  @Role(['Any'])
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') EditProfileInput: EditProfileInput,
    @Args('builidingCode') builidngCode?: string, // 선택적 매개변수
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(
      authUser.id,
      EditProfileInput,
      builidngCode,
    );
  }
  // Mutation -> 이메일 인증
  @Mutation((returns) => VerifyEmailOutput)
  async verifyEmail(
    @Args('input') verifyEmailInput: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    return await this.usersService.verifyEmail(verifyEmailInput.code);
  }
}
