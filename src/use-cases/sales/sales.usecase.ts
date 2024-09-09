import { Inject, Injectable } from '@nestjs/common';
import { Sale } from 'src/core/entities/sales.entity';
import { SaleRepository } from 'src/application/interfaces/sale-repository.interface';
import { SaleProductRepository } from 'src/application/interfaces/saleProduct-repository.interface';

@Injectable()
export class SalesUseCase {
  constructor(
    @Inject('SaleRepository')
    private readonly salesRepository: SaleRepository,
    @Inject('SalesProductsRepository')
    private readonly salesProductsRepository: SaleProductRepository,
  ) {}

  async getSales(): Promise<Sale[]> {
    try {
      return await this.salesRepository.getSales();
    } catch (error) {
      const { message } = error;
      throw new Error('Failed to get sales: ' + message);
    }
  }

  async getSale(id: string, productsIncluded: boolean) {
    try {
      const sale = await this.salesRepository.getSaleById(id);
      if (productsIncluded) {
        const products =
          await this.salesProductsRepository.getSaleProductsBySaleIdDetailed(
            sale.id,
          );
        return { saleDetails: sale, purchasedProducts: products };
      }
      return { saleDetails: sale };
    } catch (error) {
      const { message } = error;
      throw new Error('Failed to get sale: ' + message);
    }
  }
}
