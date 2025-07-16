-- AlterTable
ALTER TABLE `users` ADD COLUMN `totalOnlineSeconds` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `monthly_leaderboard` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `month` VARCHAR(191) NOT NULL,
    `seconds` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `monthly_leaderboard_month_seconds_idx`(`month`, `seconds`),
    UNIQUE INDEX `monthly_leaderboard_userId_month_key`(`userId`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `monthly_leaderboard` ADD CONSTRAINT `monthly_leaderboard_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
