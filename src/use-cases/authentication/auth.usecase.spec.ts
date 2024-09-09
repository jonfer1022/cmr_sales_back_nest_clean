import { Test, TestingModule } from '@nestjs/testing';
import { AuthUseCase } from './auth.usecase';
import {
  UserAttributes,
  UserRepository,
} from '../../../src/application/interfaces/user-repository.interface';
import { CognitoService } from '../../../src/infrastructure/aws-services/cognito.service';
import { AuthSignUpDto } from '../../../src/core/dtos/auth.dto';

const mockUserRepository = {
  getTheFirstByAttribute: jest.fn(),
  create: jest.fn(),
};

const mockCognitoService = {
  signIn: jest.fn(),
  signUp: jest.fn(),
  confirmSignUp: jest.fn(),
  signOut: jest.fn(),
  verifyAccessToken: jest.fn(),
};

describe('AuthUseCase', () => {
  let authUseCase: AuthUseCase;
  let userRepository: UserRepository;
  let cognitoService: CognitoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthUseCase,
        {
          provide: CognitoService,
          useValue: mockCognitoService,
        },
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    authUseCase = module.get<AuthUseCase>(AuthUseCase);
    cognitoService = module.get<CognitoService>(CognitoService);
    userRepository = module.get<UserRepository>('UserRepository');
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const authenticationResult = {
        AccessToken: 'accessToken',
        RefreshToken: 'refreshToken',
      };

      mockUserRepository.getTheFirstByAttribute.mockResolvedValue({
        id: 'userId',
        email,
        name: 'Test User',
      });

      mockCognitoService.signIn.mockResolvedValue({
        AuthenticationResult: authenticationResult,
      });

      const result = await authUseCase.login(email, password);

      expect(userRepository.getTheFirstByAttribute).toHaveBeenCalledWith(
        UserAttributes.EMAIL,
        email,
      );
      expect(userRepository.getTheFirstByAttribute).toHaveBeenCalledTimes(1);
      expect(cognitoService.signIn).toHaveBeenCalledWith(email, password);
      expect(result).toEqual({
        accessToken: authenticationResult.AccessToken,
        refreshToken: authenticationResult.RefreshToken,
      });
    });

    it('should throw an error if the user does not exist', async () => {
      const email = 'test@example.com';
      const password = 'password';

      mockUserRepository.getTheFirstByAttribute.mockResolvedValue(null);

      expect(authUseCase.login(email, password)).rejects.toThrow(
        'Failed to sign in: User not found',
      );
    });
  });

  describe('signUp', () => {
    it('should sign up a new user successfully', async () => {
      const authDto: AuthSignUpDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };

      mockUserRepository.getTheFirstByAttribute.mockResolvedValue(null);
      mockCognitoService.signUp.mockResolvedValue('Success');

      const result = await authUseCase.signUp(authDto);

      // The result doen't matter for this test
      expect(result).toBe('Success');

      expect(userRepository.getTheFirstByAttribute).toHaveBeenCalledWith(
        'email',
        authDto.email,
      );
      expect(cognitoService.signUp).toHaveBeenCalledWith(
        authDto.email,
        authDto.password,
        [{ Name: 'name', Value: authDto.name }],
      );
    });

    it('should throw an error if the user already exists', async () => {
      const authDto: AuthSignUpDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      const mockUser = { id: 'userId', email: authDto.email };

      (userRepository.getTheFirstByAttribute as jest.Mock).mockResolvedValue(
        mockUser,
      );

      await expect(authUseCase.signUp(authDto)).rejects.toThrow(
        'User already exists',
      );
    });
  });

  describe('confirmSignUp', () => {
    it('should confirm sign up successfully', async () => {
      const authDto: AuthSignUpDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      const code = 'code';
      const authenticationResult = {
        AccessToken: 'accessToken2',
        RefreshToken: 'refreshToken',
      };

      mockUserRepository.getTheFirstByAttribute.mockResolvedValue(null);

      mockCognitoService.confirmSignUp.mockResolvedValue('Success');

      mockUserRepository.create.mockResolvedValue({
        id: 'userId',
        name: authDto.name,
        email: authDto.email,
      });

      mockCognitoService.signIn.mockResolvedValue({
        AuthenticationResult: authenticationResult,
      });

      const result = await authUseCase.confirmSignUp(authDto, code);

      expect(cognitoService.confirmSignUp).toHaveBeenCalledWith(
        authDto.email,
        code,
      );
      expect(userRepository.create).toHaveBeenCalledWith({
        id: authDto.email,
        name: authDto.name,
        email: authDto.email,
      });
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        accessToken: authenticationResult.AccessToken,
        refreshToken: authenticationResult.RefreshToken,
      });
    });

    it('should throw an error if the user exist previously', async () => {
      const authDto: AuthSignUpDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      const code = 'code';

      mockUserRepository.getTheFirstByAttribute.mockResolvedValue({
        id: 'userId',
        name: authDto.name,
        email: authDto.email,
      });

      expect(authUseCase.confirmSignUp(authDto, code)).rejects.toThrow(
        'Failed to confirm sign up: User already exists',
      );
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const accessToken = 'accessToken';

      mockCognitoService.signOut.mockResolvedValue('Success');

      await authUseCase.signOut(accessToken);
      expect(cognitoService.signOut).toHaveBeenCalledWith(accessToken);
      expect(cognitoService.signOut).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the user does not exist', async () => {
      const accessToken = 'accessToken';
      mockCognitoService.signOut.mockRejectedValue({
        message: 'Invalid token',
      });
      expect(authUseCase.signOut(accessToken)).rejects.toThrow(
        'Failed to sign out: Invalid token',
      );
    });
  });
});
