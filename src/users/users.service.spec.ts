import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

const mockRepository = () => ({
  //페이크 레포지토리 함수 객체를 만든다
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  // 제이슨 웹 토큰 페이크 함수 객체를 만든다.
  sign: jest.fn(() => 'signed-token-baby'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  // 메일 서비스 함수 객체를 만든다.
  sendVerificationEmail: jest.fn(),
});

// Repository<T> <- 여기서 T는 엔티티로 설정이 되어 있는 객체로 가서 ORM의 테이블을 가져 오겠다는 의미임'
// Record<array,type> 형식으로 array 안에 있는 각각의 레코드의 타입을 jest.Mock으로 페이크해서 본다는 의미
// Partial은 어떤 부분적 배열을 가져 올 때 사용

type MockRepository<T = any> = Partial<
  Record<keyof Repository<User>, jest.Mock>
>; // 즉 MockRepository는 사용자의 ORM 페이크 객체 타입이다.

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'thewoowow@naver.com',
      password: '12345',
      role: 0,
      name: 'woowow',
    };
    it('should fail if user exists', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'thewwwwww@naver.com',
      });
      const result = await service.createAccount('',createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'There is already a Accout that have same email',
      });
    });
    it('should create a new user', async () => {
      userRepository.findOne.mockResolvedValue(undefined); //findOne을 건너뛰게 해주는 곳
      userRepository.create.mockReturnValue(createAccountArgs); // 계정 생성
      userRepository.save.mockResolvedValue(createAccountArgs); // 데이터 베이스 동기화
      verificationRepository.create.mockReturnValue({
        code: 'code',
        user: createAccountArgs,
      });
      verificationRepository.save.mockResolvedValue({
        code: 'code',
        user: createAccountArgs,
      });
      const result = await service.createAccount(createAccountArgs); // 계정 생성
      expect(userRepository.create).toHaveBeenCalledTimes(1); // 한 번만 실행되어야 한다.
      expect(userRepository.create).toHaveBeenCalledWith(createAccountArgs); // 인자를 입력받아야 한다.
      expect(userRepository.save).toHaveBeenCalledTimes(1); // 한 번만 실행되어야 한다.
      expect(userRepository.save).toHaveBeenCalledWith(createAccountArgs); // 인자를 입력받아야 한다.
      expect(verificationRepository.create).toHaveBeenCalledTimes(1); // 한 번만 호출되어야한다.
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      }); // 호출 시 인자를 입력받아야한다.
      expect(verificationRepository.save).toHaveBeenCalledTimes(1); // 한 번만 실행되어야 한다.
      expect(verificationRepository.save).toHaveBeenCalledWith({
        code: 'code',
        user: createAccountArgs,
      }); // 인자를 입력받아야 한다.
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({
        ok: false,
        error: "Couldn't Make a Account from your request",
      });
    });
  });

  describe('login', () => {
    const loginArg = {
      email: 'WwId',
      password: 'WwPw',
    };

    it('should fail it user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArg);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        // expect.any({"select":Object}),
        // expect.any({"where":Object}),
      );
      expect(result).toEqual({
        ok: false,
        error: 'User not found',
      });
    });
    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArg);
      expect(result).toEqual({ ok: false, error: 'Wrong Password' });
    });
    it('should return token if pasword correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArg);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({ ok: true, token: 'signed-token-baby' });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };
    it('should find an existing user', async () => {
      userRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });

    it('should fail if no user is found', async () => {
      userRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({ ok: false, error: 'User Not Found' });
    });
  });

  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'oldwoowon@naver.com',
        verified: true,
      };
      const editProfileArgs = {
        userId: 1,
        input: { email: 'newwoowon@naver.com' },
      };
      const newVerification = {
        code: 'code',
      };
      const newUser = {
        verified: false,
        email: editProfileArgs.input.email,
      };
      userRepository.findOne.mockResolvedValue(oldUser);
      verificationRepository.create.mockReturnValue(newVerification);
      verificationRepository.save.mockResolvedValue(newVerification);
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationRepository.save).toHaveBeenCalledWith(newVerification);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });
    it('should change password', async () => {
      const editProfileArgs = { userId: 1, input: { password: 'new' } };
      userRepository.findOne.mockResolvedValue({ password: 'old' });
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, { email: '12' });
      expect(result).toEqual({ ok: false, error: 'Could not update profile' });
    });
  });
  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const mockedVerification = {
        user: {
          verified: false,
        },
        id: 1,
      };
      verificationRepository.findOne.mockResolvedValue(mockedVerification);
      const result = await service.verifyEmail('');
      expect(verificationRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
      );
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith({ verified: true });
      expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationRepository.delete).toHaveBeenCalledWith(
        mockedVerification.id,
      );
      expect(result).toEqual({ ok: true });
    });
    it('should fail on verification not found', async () => {
      verificationRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Verification not found' });
    });
    it('should fail on exception', async () => {
      verificationRepository.findOne.mockResolvedValue(new Error());
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Could not verify email' });
    });
  });
});
