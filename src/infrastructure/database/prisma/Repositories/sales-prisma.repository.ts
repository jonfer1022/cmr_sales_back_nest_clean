import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SaleRepository } from 'src/application/interfaces/sale-repository.interface';

@Injectable()
export class SalesPrismaRepository implements SaleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSales() {
    return await this.prisma.sales.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  async getSaleById(id: string) {
    return await this.prisma.sales.findUnique({
      include: { user: true },
      where: { id },
    });
  }
}
