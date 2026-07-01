/*
  Warnings:

  - You are about to drop the column `apiKey` on the `dispositivos` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `dispositivos_apiKey_key` ON `dispositivos`;

-- AlterTable
ALTER TABLE `dispositivos` DROP COLUMN `apiKey`;
