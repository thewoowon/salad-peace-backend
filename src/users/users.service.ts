import {
  Global,
  Injectable,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { exist, object } from 'joi';
import { RelationId, Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import * as Jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { MailService } from 'src/mail/mail.service';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { Building } from 'src/buildings/entities/building.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    @InjectRepository(Building)
    private readonly buildings: Repository<Building>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  usersAll(): Promise<User[]> {
    return this.users.find();
  }

  async createAccount(
    buildingCode,
    { email, password, role, name }: CreateAccountInput,
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      // 일치하는 빌딩 코드가 있는지 확인 - 유일한 building Object 반드시 가져옴
      const getBuilding = await this.buildings.findOne({
        where: {
          buildingCode: buildingCode,
        },
      });
      const exists = await this.users.findOne({
        where: {
          email: email,
        },
      });
      if (exists) {
        return {
          ok: false,
          error: 'There is already a Account that have same email',
        };
      }
      // 계정 생성
      const user = await this.users.save(
        this.users.create({
          email: email,
          password: password,
          role: role,
          name: name,
          building: getBuilding,
        }),
      );
      // 여기에 이메일 인증 기능이 들어간다.
      const verification = await this.verifications.save(
        this.verifications.create({
          user: user,
        }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return {
        ok: true,
      };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: "Couldn't Make a Account from your request",
      };
    }
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    //find the user with the email
    try {
      const user = await this.users.findOne({
        select: {
          email: true,
          password: true,
          name: true,
          id: true,
        },
        where: {
          email: email,
        },
      });
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      // check if the password is correct
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong Password',
        };
      }
      // make a JWT and giv it to the user
      const token = this.jwtService.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        buildings: {
          buildingCode: user.building.buildingCode,
          name: user.building.name,
          permanentWorker: user.building.permanentWorker,
          id: user.building.id,
        },
      });
      return {
        ok: true,
        token: token,
      };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({
        select: {
          name: true,
          email: true,
          password: true,
          id: true,
          role: true,
          verified: true,
          building: {
            buildingCode: true,
            name: true,
            permanentWorker: true,
            id: true,
          },
        },
        where: {
          id: id,
        },
      });
      return {
        ok: true,
        user: user,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'User Not Found',
      };
    }
  }

  async editProfile(
    userId: number,
    { email, password, name }: EditProfileInput,
    builidngCode?: string,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne({
        select: {
          name: true,
          email: true,
          password: true,
          verified: true,
          id: true,
          role: true,
          building: {
            buildingCode: true,
            name: true,
            permanentWorker: true,
            id: true,
          },
        },
        where: {
          id: userId,
        },
      });
      if (email) {
        user.email = email;
        user.verified = false; // 재인증 필요
        user.name = name;
        if (builidngCode) {
          // 빌딩 코드가 있다면 빌딩 코드를 통해 빌딩을 찾는다.
          const getBuilding = await this.buildings.findOne({
            where: {
              buildingCode: builidngCode,
            },
          });
          user.building = getBuilding;
        } else {
          const getBuilding = await this.buildings.findOne({
            where: {
              buildingCode: builidngCode,
            },
          });
          user.building = getBuilding;
        }
        await this.verifications.delete({ user: { id: user.id } });
        const verification = await this.verifications.save(
          this.verifications.create({ user: user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not update profile',
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne({
        relations: ['user'],
        where: {
          code: code,
        },
      });
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return { ok: true };
      }
      return { ok: false, error: 'Verification not found' };
    } catch (e) {
      return { ok: false, error: 'Could not verify email' };
    }
  }
}
