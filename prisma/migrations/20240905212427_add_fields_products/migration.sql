/*
  Warnings:

  - Added the required column `stock` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "color" TEXT NOT NULL DEFAULT 'black',
ADD COLUMN     "stock" INTEGER NOT NULL;
