import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  ISaleProductBySaleId,
  SaleProductRepository,
} from 'src/application/interfaces/saleProduct-repository.interface';
import { SaleProduct } from 'src/core/entities/saleProduct.entity';

@Injectable()
export class SalesProductsPrismaRepository implements SaleProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSaleProducts(id: string): Promise<SaleProduct[]> {
    return await this.prisma.salesProducts.findMany({ where: { saleId: id } });
  }

  async getSaleProductsBySaleIdDetailed(
    saleId: string,
  ): Promise<Array<ISaleProductBySaleId>> {
    const salesProducts: Array<ISaleProductBySaleId> = await this.prisma
      .$queryRaw`
        SELECT 
          p.*,
          sp."quantity" as "amount",
          sp."quantity" * p."price" as "totalPrice",
          u."name" as "userName"
        FROM sales_products as sp
        JOIN products as p ON sp."productId" = p."id"
        JOIN users as u ON sp."userId" = u."id"
        WHERE sp."saleId" = ${saleId}
      `;
    return salesProducts;
  }
}
