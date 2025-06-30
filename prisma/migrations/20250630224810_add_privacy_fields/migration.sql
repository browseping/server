-- AlterTable
ALTER TABLE `users` ADD COLUMN `dateOfBirth` DATETIME(3) NULL,
    ADD COLUMN `dobPrivacy` ENUM('public', 'friends_only', 'private') NULL DEFAULT 'private',
    ADD COLUMN `emailPrivacy` ENUM('public', 'friends_only') NOT NULL DEFAULT 'friends_only';
