import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { SalesPrismaRepository } from './sales-prisma.repository';
import { Sale } from 'src/core/entities/sales.entity';

describe('SalesPrismaRepository', () => {
  let salesPrismaRepository: SalesPrismaRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesPrismaRepository,
        {
          provide: PrismaService,
          useValue: {
            sales: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              upsert: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    salesPrismaRepository = module.get<SalesPrismaRepository>(
      SalesPrismaRepository,
    );
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  describe('getSales', () => {
    it('should return an array of sales', async () => {
      prismaService.sales.findMany = jest.fn().mockResolvedValue(sales);
      const result = await salesPrismaRepository.getSales();
      expect(result).toEqual(sales);
      expect(prismaService.sales.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      });
    });
  });

  describe('getSaleById', () => {
    it('should return a sale', async () => {
      prismaService.sales.findUnique = jest.fn().mockResolvedValue(sales[0]);
      const result = await salesPrismaRepository.getSaleById(sales[0].id);
      expect(result).toEqual(sales[0]);
      expect(prismaService.sales.findUnique).toHaveBeenCalledWith({
        where: { id: sales[0].id },
        include: { user: true },
      });
    });
  });
});
