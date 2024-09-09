import { Sale } from 'src/core/entities/sales.entity';

export interface SaleRepository {
  getSales(): Promise<Sale[]>;
  getSaleById(id: string): Promise<Sale | null>;
}
