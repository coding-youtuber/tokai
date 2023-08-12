-- CreateTable
CREATE TABLE `Comment` (
    `cid` VARCHAR(191) NOT NULL,
    `video_id` VARCHAR(191) NOT NULL,
    `text` VARCHAR(4000) NOT NULL,
    `author_handle` VARCHAR(191) NOT NULL,
    `author_channel_id` VARCHAR(191) NOT NULL,
    `votes` INTEGER NOT NULL,
    `heart` BOOLEAN NOT NULL,
    `reply` BOOLEAN NOT NULL,
    `time_parsed` DATETIME(3) NULL,

    INDEX `Comment_author_channel_id_idx`(`author_channel_id`),
    INDEX `Comment_video_id_idx`(`video_id`),
    PRIMARY KEY (`cid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Video` (
    `video_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `views` INTEGER NOT NULL,
    `publish_date` DATETIME(3) NOT NULL,
    `channel_id` VARCHAR(191) NOT NULL,

    INDEX `Video_channel_id_idx`(`channel_id`),
    PRIMARY KEY (`video_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Channel` (
    `channel_id` VARCHAR(191) NOT NULL,
    `channel_label` VARCHAR(191) NULL,
    `handle` VARCHAR(191) NULL,
    `photo` VARCHAR(191) NULL,

    PRIMARY KEY (`channel_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
