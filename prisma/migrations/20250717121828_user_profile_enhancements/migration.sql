/*
  Warnings:

  - You are about to drop the column `privacyLevel` on the `users` table. All the data in the column will be lost.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dobPrivacy` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `privacyLevel`,
    ADD COLUMN `avatarUrl` VARCHAR(191) NULL,
    ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `discord` VARCHAR(191) NULL,
    ADD COLUMN `friendsListPrivacy` ENUM('public', 'friends_only', 'private') NOT NULL DEFAULT 'friends_only',
    ADD COLUMN `github` VARCHAR(191) NULL,
    ADD COLUMN `instagram` VARCHAR(191) NULL,
    ADD COLUMN `linkedin` VARCHAR(191) NULL,
    ADD COLUMN `snapchat` VARCHAR(191) NULL,
    ADD COLUMN `socialMediaPrivacy` ENUM('public', 'friends_only', 'private') NOT NULL DEFAULT 'friends_only',
    ADD COLUMN `telegram` VARCHAR(191) NULL,
    ADD COLUMN `twitter` VARCHAR(191) NULL,
    ADD COLUMN `website` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `dobPrivacy` ENUM('public', 'friends_only', 'private') NOT NULL DEFAULT 'private';
