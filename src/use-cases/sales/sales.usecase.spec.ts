import { Test, TestingModule } from '@nestjs/testing';
import { SalesUseCase } from './sales.usecase';
import { SaleRepository } from 'src/application/interfaces/sale-repository.interface';
import {
  ISaleProductBySaleId,
  SaleProductRepository,
} from 'src/application/interfaces/saleProduct-repository.interface';
import { Sale } from 'src/core/entities/sales.entity';

const mockSaleRepository = {
  getSales: jest.fn(),
  getSaleById: jest.fn(),
};

const mockSalesProductsRepository = {
  getSaleProductsBySaleIdDetailed: jest.fn(),
};

describe('SalesUseCase', () => {
  let salesUseCase: SalesUseCase;
  let saleRepository: SaleRepository;
  let salesProductsRepository: SaleProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    }).compile();

    salesUseCase = module.get<SalesUseCase>(SalesUseCase);
    saleRepository = module.get<SaleRepository>('SaleRepository');
    salesProductsRepository = module.get<SaleProductRepository>(
      'SalesProductsRepository',
    );
  });

  const sales: Sale[] = [
    {
      id: 'saleId1',
      reference: 'ref1',
      status: 'pending',
      amount: 10,
      totalPrice: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'userId1',
    },
    {
      id: 'saleId2',
      reference: 'ref2',
      status: 'pending',
      amount: 20,
      totalPrice: 200,
      createdAt: new Date(),
      updatedAt: new Date(),
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

  describe('getSales', () => {
    it('should return an array of sales', async () => {
      mockSaleRepository.getSales.mockResolvedValue(sales);

      const result = await salesUseCase.getSales();

      expect(saleRepository.getSales).toHaveBeenCalledTimes(1);
      expect(result).toEqual(sales);
    });

    it('should throw an error if the method getSales fails', async () => {
      mockSaleRepository.getSales.mockRejectedValue(new Error('Error'));

      expect(saleRepository.getSales).toHaveBeenCalledTimes(1);
      expect(salesUseCase.getSales()).rejects.toThrow('Error');
    });
  });

  describe('getSale', () => {
    it('should return just a sale without products included', async () => {
      mockSaleRepository.getSaleById.mockResolvedValue(sales[0]);

      const result = await salesUseCase.getSale(sales[0].id, false);

      expect(saleRepository.getSaleById).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ saleDetails: sales[0] });
    });

    it('should return just a sale with products included', async () => {
      mockSaleRepository.getSaleById.mockResolvedValue(sales[0]);
      mockSalesProductsRepository.getSaleProductsBySaleIdDetailed.mockResolvedValue(
        products,
      );

      const result = await salesUseCase.getSale(sales[0].id, true);

      expect(saleRepository.getSaleById).toHaveBeenCalledTimes(2);
      expect(saleRepository.getSaleById).toHaveBeenCalledWith(sales[0].id);
      expect(
        salesProductsRepository.getSaleProductsBySaleIdDetailed,
      ).toHaveBeenCalledTimes(1);
      expect(
        salesProductsRepository.getSaleProductsBySaleIdDetailed,
      ).toHaveBeenCalledWith(sales[0].id);
      expect(result).toEqual({
        saleDetails: sales[0],
        purchasedProducts: products,
      });
    });

    it('should throw an error if the method getSale fails', async () => {
      mockSaleRepository.getSaleById.mockRejectedValue(new Error('Error'));

      expect(salesUseCase.getSale(sales[0].id, false)).rejects.toThrow('Error');
    });
  });
});
