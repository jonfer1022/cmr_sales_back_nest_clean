import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import {
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { AuthController } from '../../controllers/authentication/auth.controller';
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

const mockAuthUseCase = {
  signOut: jest.fn(),
  login: jest.fn(),
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

//This is not a test to the controllers logic, it is a test to the middleware.
describe('Auth Middleware', () => {
  let app: INestApplication;
  let authUseCase: AuthUseCase;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthUseCase,
          useValue: mockAuthUseCase,
        },
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

    authUseCase = moduleFixture.get<AuthUseCase>(AuthUseCase);
  });

  it('middleware should execute when the token is provided and the route is not excluded', () => {
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

    mockAuthUseCase.signOut.mockResolvedValue('Signed out');

    return request(app.getHttpServer())
      .post('/api/auth/signout')
      .set({ Authorization: 'Bearer accessToken' })
      .expect(200)
      .expect('Signed out');
  });

  it('Middleware should not exectue when the route is excluded', () => {
    const authDto = { email: 'test@example.com', password: 'password' };
    mockAuthUseCase.login.mockResolvedValue({
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    });

    return request(app.getHttpServer())
      .post('/api/auth/login')
      .set({ Authorization: 'Bearer accessToken' })
      .send(authDto)
      .expect(200)
      .expect({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
  });

  it('Middleware should return 401 (Unauthorized) if the token is not provided', () => {
    return request(app.getHttpServer())
      .post('/api/auth/signout')
      .expect(401)
      .expect({
        message: 'Unauthorized',
      });
  });

  it('Middleware should fail if the user is not found', () => {
    mockCognitoService.verifyAccessToken.mockResolvedValue({
      UserAttributes: [
        { Name: 'email', Value: 'email' },
        { Name: 'name', Value: 'name' },
        { Name: 'email_verified', Value: 'true' },
      ],
    });
    mockUserRepository.getTheFirstByAttribute.mockResolvedValue(null);

    return request(app.getHttpServer())
      .post('/api/auth/signout')
      .set({ Authorization: 'Bearer accessToken' })
      .expect(401)
      .expect({
        message: 'User not found',
      });
  });

  afterAll(() => {
    app.close();
  });
});
