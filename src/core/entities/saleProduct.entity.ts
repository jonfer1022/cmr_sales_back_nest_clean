export class SaleProduct {
  constructor(
    public id: string,
    public saleId: string,
    public productId: string,
    public quantity: number,
    public createdAt: Date | string,
    public updatedAt: Date | string,
  ) {}
}
