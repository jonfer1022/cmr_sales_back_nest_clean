import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { SalesProductsPrismaRepository } from './salesProducts-prisma.repository';
import { SaleProduct } from 'src/core/entities/saleProduct.entity';
import { ISaleProductBySaleId } from 'src/application/interfaces/saleProduct-repository.interface';

describe('SalesPrismaRepository', () => {
  let salesProductsPrismaRepository: SalesProductsPrismaRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesProductsPrismaRepository,
        {
          provide: PrismaService,
          useValue: {
            salesProducts: {
              findMany: jest.fn(),
            },
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    salesProductsPrismaRepository = module.get<SalesProductsPrismaRepository>(
      SalesProductsPrismaRepository,
    );
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const saleProducts: SaleProduct[] = [
    {
      id: 'saleId1',
      saleId: 'saleId1',
      productId: 'productId1',
      quantity: 10,
      createdAt: `${new Date()}`,
      updatedAt: `${new Date()}`,
    },
    {
      id: 'saleId2',
      saleId: 'saleId2',
      productId: 'productId2',
      quantity: 20,
      createdAt: `${new Date()}`,
      updatedAt: `${new Date()}`,
    },
  ];

  const saleProductsDetailed: ISaleProductBySaleId[] = [
    {
      id: 'saleProductId1',
      productId: 'productId1',
      amount: 10,
      quantity: 10,
      userName: 'userName1',
      totalPrice: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      saleId: 'saleId1',
    },
    {
      id: 'saleProductId2',
      productId: 'productId2',
      amount: 20,
      quantity: 20,
      totalPrice: 200,
      userName: 'userName2',
      createdAt: new Date(),
      updatedAt: new Date(),
      saleId: 'saleId2',
    },
  ];

  describe('getSaleProducts', () => {
    it('should return an array of sales-products', async () => {
      prismaService.salesProducts.findMany = jest
        .fn()
        .mockResolvedValue(saleProducts);
      const result =
        await salesProductsPrismaRepository.getSaleProducts('saleId1');
      expect(result).toEqual(saleProducts);
      expect(prismaService.salesProducts.findMany).toHaveBeenCalledWith({
        where: { saleId: 'saleId1' },
      });
    });
  });

  describe('getSaleProductsBySaleIdDetailed', () => {
    it('should return an array of sales-products', async () => {
      prismaService.$queryRaw = jest
        .fn()
        .mockResolvedValue(saleProductsDetailed);
      const result =
        await salesProductsPrismaRepository.getSaleProductsBySaleIdDetailed(
          'saleId1',
        );
      expect(result).toEqual(saleProductsDetailed);
    });
  });
});
