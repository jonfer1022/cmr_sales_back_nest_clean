import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/database/prisma/prisma.module';
import { SalesUseCase } from './sales.usecase';
import { SalesController } from 'src/controllers/sales/sales.controller';
import { SalesPrismaRepository } from 'src/infrastructure/database/prisma/Repositories/sales-prisma.repository';
import { SalesProductsPrismaRepository } from 'src/infrastructure/database/prisma/Repositories/salesProducts-prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [SalesController],
  providers: [
    SalesUseCase,
    {
      provide: 'SaleRepository',
      useClass: SalesPrismaRepository,
    },
    {
      provide: 'SalesProductsRepository',
      useClass: SalesProductsPrismaRepository,
    },
  ],
  exports: [SalesUseCase],
})
export class SalesModule {}
