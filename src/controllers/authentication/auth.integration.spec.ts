import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import {
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthUseCase } from 'src/use-cases/authentication/auth.usecase';
import { CognitoService } from 'src/infrastructure/aws-services/cognito.service';
import { AuthMiddleware } from 'src/core/middlewares/auth.middleware';
import { pathsExcluded } from 'src/app.module';

const mockCognitoService = {
  signIn: jest.fn(),
  signUp: jest.fn(),
  confirmSignUp: jest.fn(),
  signOut: jest.fn(),
  verifyAccessToken: jest.fn(),
};

const mockUserRepository = {
  getTheFirstByAttribute: jest.fn(),
  create: jest.fn(),
};

@Module({
  providers: [
    {
      provide: CognitoService,
      useValue: mockCognitoService,
    },
    {
      provide: 'UserRepository',
      useValue: mockUserRepository,
    },
  ],
})
class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(...pathsExcluded)
      .forRoutes('*');
  }
}

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('login', () => {
    it('/POST login should login successfully', () => {
      const authDto = { email: 'test@example.com', password: 'password' };
      mockCognitoService.signIn.mockResolvedValue({
        AuthenticationResult: {
          AccessToken: 'accessToken',
          RefreshToken: 'refreshToken',
        },
      });

      mockUserRepository.getTheFirstByAttribute.mockResolvedValue({
        id: 'userId',
        email: authDto.email,
        name: 'Test User',
      });

      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send(authDto)
        .expect(200)
        .expect({
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
        });
    });

    it('/POST login should fail if the params are invalid', () => {
      const authDto = {};
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send(authDto)
        .expect(400)
        .expect(({ body }) => {
          expect(body.message).toEqual([
            'email must be a string',
            'email should not be empty',
            'password must be a string',
            'password should not be empty',
          ]);
          expect(body.error).toEqual('Bad Request');
        });
    });
  });

  describe('signUp', () => {
    it('/POST signUp should sign up successfully', () => {
      const authDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };

      mockUserRepository.getTheFirstByAttribute.mockResolvedValue(null);
      mockCognitoService.signUp.mockResolvedValue('Success');

      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(authDto)
        .expect(201)
        .expect('Success');
    });

    it('/POST signUp should fail if the params are invalid', () => {
      const authDto = {};
      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(authDto)
        .expect(400)
        .expect(({ body }) => {
          expect(body.message).toEqual([
            'name must be a string',
            'name should not be empty',
            'email must be a string',
            'email should not be empty',
            'password must be a string',
            'password should not be empty',
          ]);
          expect(body.error).toEqual('Bad Request');
        });
    });
  });

  describe('confirmSignUp', () => {
    it('/POST confirmSignUp should confirm sign up successfully', () => {
      const authDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      const code = 'code';
      const authenticationResult = {
        AccessToken: 'accessToken',
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

      return request(app.getHttpServer())
        .post('/api/auth/confirm-signup')
        .send({ ...authDto, code })
        .expect(200)
        .expect({
          accessToken: authenticationResult.AccessToken,
          refreshToken: authenticationResult.RefreshToken,
        });
    });

    it('/POST confirmSignUp should fail if the params are invalid', () => {
      const authDto = {};
      const code = 'code';
      return request(app.getHttpServer())
        .post('/api/auth/confirm-signup')
        .send({ ...authDto, code })
        .expect(400)
        .expect(({ body }) => {
          expect(body.message).toEqual([
            'email must be a string',
            'email should not be empty',
            'password must be a string',
            'password should not be empty',
            'name must be a string',
            'name should not be empty',
          ]);
          expect(body.error).toEqual('Bad Request');
        });
    });
  });

  describe('signOut', () => {
    it('/POST signOut should sign out successfully', () => {
      const authDto = { email: 'test@example.com', password: 'password' };

      mockCognitoService.verifyAccessToken.mockResolvedValue({
        UserAttributes: [
          { Name: 'email', Value: 'email' },
          { Name: 'name', Value: 'name' },
          { Name: 'email_verified', Value: 'true' },
        ],
      });
      mockUserRepository.getTheFirstByAttribute.mockResolvedValue({
        id: 'userId',
        email: authDto.email,
        name: 'Test User',
      });

      return request(app.getHttpServer())
        .post('/api/auth/signout')
        .set({ Authorization: 'Bearer accessToken' })
        .expect(200)
        .expect('Signed out');
    });

    it('/POST signOut should fail if the token wasnt provided', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signout')
        .expect(401)
        .expect(({ body }) => {
          expect(body.message).toEqual('Unauthorized');
        });
    });
  });

  afterAll(() => {
    app.close();
  });
});
