import { SaleProduct } from 'src/core/entities/saleProduct.entity';

export interface ISaleProductBySaleId extends SaleProduct {
  amount: number;
  totalPrice: number;
  userName: string;
}

export interface SaleProductRepository {
  getSaleProducts(id: string): Promise<SaleProduct[]>;
  getSaleProductsBySaleIdDetailed(
    saleId: string,
  ): Promise<Array<ISaleProductBySaleId>>;
}
