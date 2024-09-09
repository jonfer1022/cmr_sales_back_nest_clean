import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import {
  HttpStatus,
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { SalesController } from './sales.controller';
import { CognitoService } from 'src/infrastructure/aws-services/cognito.service';
import { AuthMiddleware } from 'src/core/middlewares/auth.middleware';
import { pathsExcluded } from 'src/app.module';
import { SalesUseCase } from 'src/use-cases/sales/sales.usecase';
import { Sale } from 'src/core/entities/sales.entity';
import { ISaleProductBySaleId } from 'src/application/interfaces/saleProduct-repository.interface';

const mockCognitoService = {
  verifyAccessToken: jest.fn(),
};

const mockUserRepository = {
  getTheFirstByAttribute: jest.fn(),
  create: jest.fn(),
};

const mockSaleRepository = {
  getSales: jest.fn(),
  getSaleById: jest.fn(),
};

const mockSalesProductsRepository = {
  getSaleProductsBySaleIdDetailed: jest.fn(),
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

describe('SalesController (Integration)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        SalesUseCase,
        {
          provide: 'SaleRepository',
          useValue: mockSaleRepository,
        },
        {
          provide: 'SalesProductsRepository',
          useValue: mockSalesProductsRepository,
        },
      ],
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  mockCognitoService.verifyAccessToken.mockResolvedValue({
    UserAttributes: [
      { Name: 'email', Value: 'email' },
      { Name: 'name', Value: 'name' },
      { Name: 'email_verified', Value: 'true' },
    ],
  });

  mockUserRepository.getTheFirstByAttribute.mockResolvedValue({
    id: 'userId',
    email: 'test@example.com',
    name: 'Test User',
  });

  const sales: Sale[] = [
    {
      id: 'saleId1',
      reference: 'ref1',
      status: 'pending',
      amount: 10,
      totalPrice: 100,
      createdAt: `${new Date()}`,
      updatedAt: `${new Date()}`,
      userId: 'userId1',
    },
    {
      id: 'saleId2',
      reference: 'ref2',
      status: 'pending',
      amount: 20,
      totalPrice: 200,
      createdAt: `${new Date()}`,
      updatedAt: `${new Date()}`,
      userId: 'userId2',
    },
  ];

  const products: ISaleProductBySaleId[] = [
    {
      id: 'saleProductId1',
      productId: 'productId1',
      amount: 10,
      quantity: 10,
      userName: 'userName1',
      totalPrice: 100,
      createdAt: `${new Date()}`,
      updatedAt: `${new Date()}`,
      saleId: 'saleId1',
    },
    {
      id: 'saleProductId2',
      productId: 'productId2',
      amount: 20,
      quantity: 20,
      totalPrice: 200,
      userName: 'userName2',
      createdAt: `${new Date()}`,
      updatedAt: `${new Date()}`,
      saleId: 'saleId2',
    },
  ];

  describe('getSales', () => {
    it('/GET getSales should return an array of sales', () => {
      mockSaleRepository.getSales.mockResolvedValue(sales);

      return request(app.getHttpServer())
        .get('/api/sales')
        .set({ Authorization: 'Bearer accessToken' })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(sales);
        });
    });

    it('/GET getSales should throw an error', () => {
      mockSaleRepository.getSales.mockRejectedValue(new Error('Error'));

      return request(app.getHttpServer())
        .get('/api/sales')
        .set({ Authorization: 'Bearer accessToken' })
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.status).toEqual(HttpStatus.BAD_REQUEST);
          expect(body.message).toEqual('Failed to get sales: Error');
        });
    });
  });

  describe('getSale', () => {
    it('should return just a sale without products included', async () => {
      mockSaleRepository.getSaleById.mockResolvedValue(sales[0]);

      await request(app.getHttpServer())
        .get(`/api/sales/${sales[0].id}`)
        .set({ Authorization: 'Bearer accessToken' })
        .expect(200)
        .expect(({ body }) => {
          expect(body?.saleDetails).toEqual(sales[0]);
        });
    });

    it('should return just a sale with products included', async () => {
      mockSaleRepository.getSaleById.mockResolvedValue(sales[0]);
      mockSalesProductsRepository.getSaleProductsBySaleIdDetailed.mockResolvedValue(
        products,
      );

      await request(app.getHttpServer())
        .get(`/api/sales/${sales[0].id}?includeProductsPurchased=true`)
        .set({ Authorization: 'Bearer accessToken' })
        .expect(200)
        .expect(({ body }) => {
          expect(body?.saleDetails).toEqual(sales[0]);
          expect(body?.purchasedProducts).toEqual(products);
        });
    });
  });

  afterAll(() => {
    app.close();
  });
});
