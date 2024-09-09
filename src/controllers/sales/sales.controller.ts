import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { SalesUseCase } from 'src/use-cases/sales/sales.usecase';

@Controller('api/sales')
export class SalesController {
  constructor(private salesUseCase: SalesUseCase) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getSales() {
    try {
      return await this.salesUseCase.getSales();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
        { cause: error },
      );
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getSaleById(
    @Param('id') saleId: string,
    @Query() params: { includeProductsPurchased: string },
  ) {
    const { includeProductsPurchased } = params;
    return await this.salesUseCase.getSale(
      saleId,
      !!includeProductsPurchased?.length,
    );
  }
}
