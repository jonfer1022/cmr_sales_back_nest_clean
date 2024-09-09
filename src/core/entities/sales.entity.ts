export class Sale {
  constructor(
    public id: string,
    public reference: string,
    public status: string,
    public amount: number,
    public totalPrice: number,
    public createdAt: Date | string,
    public updatedAt: Date | string,
    public userId: string,
  ) {}
}
