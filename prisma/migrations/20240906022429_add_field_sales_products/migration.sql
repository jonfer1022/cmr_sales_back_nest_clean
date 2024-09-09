/*
  Warnings:

  - Added the required column `userId` to the `sales_products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sales_products" ADD COLUMN     "userId" VARCHAR(250) NOT NULL;

-- AddForeignKey
ALTER TABLE "sales_products" ADD CONSTRAINT "sales_products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
