import {MigrationInterface, QueryRunner} from "typeorm";

export class syncEntitiesAndDbMigration1634365894157 implements MigrationInterface {
    name = 'syncEntitiesAndDbMigration1634365894157'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `users` (`id` int NOT NULL AUTO_INCREMENT, `first_name` varchar(255) NOT NULL, `last_name` varchar(255) NOT NULL, `user_name` varchar(30) NOT NULL, `country_code` enum ('NG') NOT NULL DEFAULT 'NG', `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `phone_number` varchar(255) NULL, `cover_picture_url` varchar(255) NULL, `profile_picture_url` varchar(255) NULL, `is_content_creator` tinyint NOT NULL DEFAULT 0, `bio` text NULL, `location` varchar(255) NULL, `web_link` varchar(255) NULL, `reset_token` varchar(255) NULL, `bvn` varchar(30) NULL, `date_of_birth` date NULL, `is_confirmed` tinyint NOT NULL DEFAULT 0, `email_notification_status` tinyint NOT NULL DEFAULT 0, `push_notification_status` tinyint NOT NULL DEFAULT 0, `subscription_fee` decimal(12,2) NOT NULL DEFAULT '0.0', `subscribers_count` int NOT NULL DEFAULT '0', `blocked_count` int NOT NULL DEFAULT '0', `status` enum ('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'INACTIVE', `subscription_type` enum ('FREE', 'PAID') NOT NULL DEFAULT 'FREE', `available_balance` decimal(12,2) NOT NULL DEFAULT '0.0', `balance_on_hold` decimal(12,2) NOT NULL DEFAULT '0.0', `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_074a1f262efaca6aba16f7ed92` (`user_name`), UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `bank_accounts` (`id` int NOT NULL AUTO_INCREMENT, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `bank_code` varchar(255) NOT NULL, `bank_name` varchar(255) NOT NULL, `account_name` varchar(255) NOT NULL, `account_number` varchar(255) NOT NULL, `is_default` tinyint NOT NULL DEFAULT 0, `user_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `blocks` (`id` int NOT NULL AUTO_INCREMENT, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `blocker_id` int NULL, `blocked_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `post_media` (`id` int NOT NULL AUTO_INCREMENT, `url` varchar(255) NOT NULL, `media_type` enum ('image', 'video') NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `post_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `likes` (`id` int NOT NULL AUTO_INCREMENT, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `author_id` int NULL, `post_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `posts` (`id` int NOT NULL AUTO_INCREMENT, `caption` varchar(200) NULL, `comments_count` int NOT NULL, `likes_count` int NOT NULL, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `author_id` int NULL, `parent_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `bookmarks` (`id` int NOT NULL AUTO_INCREMENT, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `post_id` int NULL, `user_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `conversations` (`id` int NOT NULL AUTO_INCREMENT, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `conversation_type` enum ('ONE_TO_ONE') NOT NULL DEFAULT 'ONE_TO_ONE', `last_message_id` int NULL, UNIQUE INDEX `REL_a53679287450d522a3f700088e` (`last_message_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `messages` (`id` int NOT NULL AUTO_INCREMENT, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `sender_id` int NOT NULL, `receiver_id` int NOT NULL, `body` varchar(200) NULL, `is_paid` tinyint NOT NULL DEFAULT 0, `can_view` tinyint NOT NULL DEFAULT 1, `cost` decimal(12,2) NOT NULL DEFAULT '0.0', `is_read` tinyint NOT NULL DEFAULT 0, `conversation_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `chat_media` (`id` int NOT NULL AUTO_INCREMENT, `url` varchar(255) NOT NULL, `media_type` enum ('image', 'video') NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `message_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `comments` (`id` int NOT NULL AUTO_INCREMENT, `message` varchar(200) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `author_id` int NULL, `post_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `media` (`id` int NOT NULL AUTO_INCREMENT, `type` enum ('image', 'video') NOT NULL, `url` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `notifications` (`id` int NOT NULL AUTO_INCREMENT, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `meta` text NULL, `message` varchar(255) NOT NULL, `status` enum ('READ', 'UNREAD') NOT NULL DEFAULT 'UNREAD', `type` enum ('SUBSCRIPTION', 'BOOKMARK', 'COMMENT', 'LIKE', 'TIP') NOT NULL, `read_date` datetime NULL, `recipient_id` int NULL, `sender_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `reports` (`id` int NOT NULL AUTO_INCREMENT, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `reason` varchar(255) NOT NULL, `reported_id` int NOT NULL, `reported_type` enum ('POST', 'USER') NOT NULL, `reporter_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `subscriptions` (`id` int NOT NULL AUTO_INCREMENT, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `expiry_date` date NOT NULL, `subscription_type` enum ('REGULAR') NOT NULL DEFAULT 'REGULAR', `subscriber_id` int NULL, `subscribee_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `transactions` (`id` int NOT NULL AUTO_INCREMENT, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `currency` varchar(255) NULL, `amount` decimal(12,2) NOT NULL, `transaction_reference` varchar(45) NULL, `reference` varchar(45) NOT NULL, `transaction_id` int NULL, `payment_provider` enum ('FLUTTERWAVE') NULL, `payment_status` enum ('NEW', 'SUCCESSFUL', 'FAILED') NOT NULL DEFAULT 'NEW', `transaction_type` enum ('TOP_UP', 'WITHDRAWAL', 'SUBSCRIPTION', 'TIP', 'PAY_PER_VIEW', 'PAY_PER_VIEW_DM', 'REFUND') NOT NULL, `description` text NOT NULL, `payment_provider_response_message` text NOT NULL, `meta` text NULL, `payment_date` datetime NULL, `user_id` int NULL, UNIQUE INDEX `idx_transaction_reference` (`transaction_reference`), UNIQUE INDEX `idx_reference` (`reference`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `wallet_history` (`id` int NOT NULL AUTO_INCREMENT, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `user_id` int NOT NULL, `initiator_id` int NULL, `type` enum ('TOP_UP', 'WITHDRAWAL', 'SUBSCRIPTION', 'TIP', 'PAY_PER_VIEW', 'PAY_PER_VIEW_DM', 'REFUND') NOT NULL, `payment_type` enum ('CREDIT', 'DEBIT') NULL, `amount` decimal(12,2) NOT NULL DEFAULT '0.0', `fee` decimal(12,2) NOT NULL DEFAULT '0.0', `transaction_id` int NULL, UNIQUE INDEX `REL_7192c4d59ba1185010f48a7863` (`transaction_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `wallet_ledger` (`id` int NOT NULL AUTO_INCREMENT, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `user_id` int NOT NULL, `amount` decimal(12,2) NOT NULL DEFAULT '0.0', `ledger_status` enum ('ON_HOLD', 'RELEASED') NOT NULL DEFAULT 'ON_HOLD', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `conversations_users` (`conversation_id` int NOT NULL, `user_id` int NOT NULL, INDEX `IDX_37b1d88312d665f0f854b26e05` (`conversation_id`), INDEX `IDX_07f4b07b537939ad13b9436cef` (`user_id`), PRIMARY KEY (`conversation_id`, `user_id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `bank_accounts` ADD CONSTRAINT `FK_29146c4a8026c77c712e01d922b` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `blocks` ADD CONSTRAINT `FK_74f530c6fbffc357047b263818d` FOREIGN KEY (`blocker_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `blocks` ADD CONSTRAINT `FK_8aa6c887bed61ad10829450f2f0` FOREIGN KEY (`blocked_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `post_media` ADD CONSTRAINT `FK_1eeb54a4fdfbe9db17899243cbe` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `likes` ADD CONSTRAINT `FK_11f930ef5675078349464caba56` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `likes` ADD CONSTRAINT `FK_741df9b9b72f328a6d6f63e79ff` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `posts` ADD CONSTRAINT `FK_312c63be865c81b922e39c2475e` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `posts` ADD CONSTRAINT `FK_d8be760cd953c4a98137c5237a6` FOREIGN KEY (`parent_id`) REFERENCES `posts`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `bookmarks` ADD CONSTRAINT `FK_51f539993ae903a927bd44dbe49` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `bookmarks` ADD CONSTRAINT `FK_58a0fbaee65cd8959a870ee678c` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `conversations` ADD CONSTRAINT `FK_a53679287450d522a3f700088e9` FOREIGN KEY (`last_message_id`) REFERENCES `messages`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `messages` ADD CONSTRAINT `FK_22133395bd13b970ccd0c34ab22` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `messages` ADD CONSTRAINT `FK_b561864743d235f44e70addc1f5` FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `messages` ADD CONSTRAINT `FK_3bc55a7c3f9ed54b520bb5cfe23` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `chat_media` ADD CONSTRAINT `FK_56b93f47018fd306357619c80b5` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `comments` ADD CONSTRAINT `FK_e6d38899c31997c45d128a8973b` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `comments` ADD CONSTRAINT `FK_259bf9825d9d198608d1b46b0b5` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `notifications` ADD CONSTRAINT `FK_5332a4daa46fd3f4e6625dd275d` FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `notifications` ADD CONSTRAINT `FK_4140c8b09ff58165daffbefbd7e` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `reports` ADD CONSTRAINT `FK_9459b9bf907a3807ef7143d2ead` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `subscriptions` ADD CONSTRAINT `FK_f56b7683178d56b3907fea72489` FOREIGN KEY (`subscriber_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `subscriptions` ADD CONSTRAINT `FK_8d07255c9851c03e7f22917f6de` FOREIGN KEY (`subscribee_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `transactions` ADD CONSTRAINT `FK_e9acc6efa76de013e8c1553ed2b` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `wallet_history` ADD CONSTRAINT `FK_26c98538f0dd8cb2794daa753fd` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `wallet_history` ADD CONSTRAINT `FK_7192c4d59ba1185010f48a78639` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `wallet_history` ADD CONSTRAINT `FK_21795e2c1b1e9da57ac685170c5` FOREIGN KEY (`initiator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `wallet_ledger` ADD CONSTRAINT `FK_c7e9efe5a3b0a356eefbf012f64` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `conversations_users` ADD CONSTRAINT `FK_37b1d88312d665f0f854b26e052` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `conversations_users` ADD CONSTRAINT `FK_07f4b07b537939ad13b9436cefa` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `conversations_users` DROP FOREIGN KEY `FK_07f4b07b537939ad13b9436cefa`");
        await queryRunner.query("ALTER TABLE `conversations_users` DROP FOREIGN KEY `FK_37b1d88312d665f0f854b26e052`");
        await queryRunner.query("ALTER TABLE `wallet_ledger` DROP FOREIGN KEY `FK_c7e9efe5a3b0a356eefbf012f64`");
        await queryRunner.query("ALTER TABLE `wallet_history` DROP FOREIGN KEY `FK_21795e2c1b1e9da57ac685170c5`");
        await queryRunner.query("ALTER TABLE `wallet_history` DROP FOREIGN KEY `FK_7192c4d59ba1185010f48a78639`");
        await queryRunner.query("ALTER TABLE `wallet_history` DROP FOREIGN KEY `FK_26c98538f0dd8cb2794daa753fd`");
        await queryRunner.query("ALTER TABLE `transactions` DROP FOREIGN KEY `FK_e9acc6efa76de013e8c1553ed2b`");
        await queryRunner.query("ALTER TABLE `subscriptions` DROP FOREIGN KEY `FK_8d07255c9851c03e7f22917f6de`");
        await queryRunner.query("ALTER TABLE `subscriptions` DROP FOREIGN KEY `FK_f56b7683178d56b3907fea72489`");
        await queryRunner.query("ALTER TABLE `reports` DROP FOREIGN KEY `FK_9459b9bf907a3807ef7143d2ead`");
        await queryRunner.query("ALTER TABLE `notifications` DROP FOREIGN KEY `FK_4140c8b09ff58165daffbefbd7e`");
        await queryRunner.query("ALTER TABLE `notifications` DROP FOREIGN KEY `FK_5332a4daa46fd3f4e6625dd275d`");
        await queryRunner.query("ALTER TABLE `comments` DROP FOREIGN KEY `FK_259bf9825d9d198608d1b46b0b5`");
        await queryRunner.query("ALTER TABLE `comments` DROP FOREIGN KEY `FK_e6d38899c31997c45d128a8973b`");
        await queryRunner.query("ALTER TABLE `chat_media` DROP FOREIGN KEY `FK_56b93f47018fd306357619c80b5`");
        await queryRunner.query("ALTER TABLE `messages` DROP FOREIGN KEY `FK_3bc55a7c3f9ed54b520bb5cfe23`");
        await queryRunner.query("ALTER TABLE `messages` DROP FOREIGN KEY `FK_b561864743d235f44e70addc1f5`");
        await queryRunner.query("ALTER TABLE `messages` DROP FOREIGN KEY `FK_22133395bd13b970ccd0c34ab22`");
        await queryRunner.query("ALTER TABLE `conversations` DROP FOREIGN KEY `FK_a53679287450d522a3f700088e9`");
        await queryRunner.query("ALTER TABLE `bookmarks` DROP FOREIGN KEY `FK_58a0fbaee65cd8959a870ee678c`");
        await queryRunner.query("ALTER TABLE `bookmarks` DROP FOREIGN KEY `FK_51f539993ae903a927bd44dbe49`");
        await queryRunner.query("ALTER TABLE `posts` DROP FOREIGN KEY `FK_d8be760cd953c4a98137c5237a6`");
        await queryRunner.query("ALTER TABLE `posts` DROP FOREIGN KEY `FK_312c63be865c81b922e39c2475e`");
        await queryRunner.query("ALTER TABLE `likes` DROP FOREIGN KEY `FK_741df9b9b72f328a6d6f63e79ff`");
        await queryRunner.query("ALTER TABLE `likes` DROP FOREIGN KEY `FK_11f930ef5675078349464caba56`");
        await queryRunner.query("ALTER TABLE `post_media` DROP FOREIGN KEY `FK_1eeb54a4fdfbe9db17899243cbe`");
        await queryRunner.query("ALTER TABLE `blocks` DROP FOREIGN KEY `FK_8aa6c887bed61ad10829450f2f0`");
        await queryRunner.query("ALTER TABLE `blocks` DROP FOREIGN KEY `FK_74f530c6fbffc357047b263818d`");
        await queryRunner.query("ALTER TABLE `bank_accounts` DROP FOREIGN KEY `FK_29146c4a8026c77c712e01d922b`");
        await queryRunner.query("DROP INDEX `IDX_07f4b07b537939ad13b9436cef` ON `conversations_users`");
        await queryRunner.query("DROP INDEX `IDX_37b1d88312d665f0f854b26e05` ON `conversations_users`");
        await queryRunner.query("DROP TABLE `conversations_users`");
        await queryRunner.query("DROP TABLE `wallet_ledger`");
        await queryRunner.query("DROP INDEX `REL_7192c4d59ba1185010f48a7863` ON `wallet_history`");
        await queryRunner.query("DROP TABLE `wallet_history`");
        await queryRunner.query("DROP INDEX `idx_reference` ON `transactions`");
        await queryRunner.query("DROP INDEX `idx_transaction_reference` ON `transactions`");
        await queryRunner.query("DROP TABLE `transactions`");
        await queryRunner.query("DROP TABLE `subscriptions`");
        await queryRunner.query("DROP TABLE `reports`");
        await queryRunner.query("DROP TABLE `notifications`");
        await queryRunner.query("DROP TABLE `media`");
        await queryRunner.query("DROP TABLE `comments`");
        await queryRunner.query("DROP TABLE `chat_media`");
        await queryRunner.query("DROP TABLE `messages`");
        await queryRunner.query("DROP INDEX `REL_a53679287450d522a3f700088e` ON `conversations`");
        await queryRunner.query("DROP TABLE `conversations`");
        await queryRunner.query("DROP TABLE `bookmarks`");
        await queryRunner.query("DROP TABLE `posts`");
        await queryRunner.query("DROP TABLE `likes`");
        await queryRunner.query("DROP TABLE `post_media`");
        await queryRunner.query("DROP TABLE `blocks`");
        await queryRunner.query("DROP TABLE `bank_accounts`");
        await queryRunner.query("DROP INDEX `IDX_97672ac88f789774dd47f7c8be` ON `users`");
        await queryRunner.query("DROP INDEX `IDX_074a1f262efaca6aba16f7ed92` ON `users`");
        await queryRunner.query("DROP TABLE `users`");
    }

}
