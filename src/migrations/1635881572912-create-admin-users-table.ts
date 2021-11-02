import {MigrationInterface, QueryRunner} from "typeorm";

export class createAdminUsersTable1635881572912 implements MigrationInterface {
    name = 'createAdminUsersTable1635881572912'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `admin_users` (`id` int NOT NULL AUTO_INCREMENT, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `first_name` varchar(255) NOT NULL, `last_name` varchar(255) NOT NULL, `user_name` varchar(30) NOT NULL, `email` varchar(255) NOT NULL, `password` varchar(255) NULL, `reset_token` varchar(255) NULL, `is_confirmed` tinyint NOT NULL DEFAULT 0, `status` enum ('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'INACTIVE', UNIQUE INDEX `IDX_a2fdcf475667ebb48b39f7623c` (`user_name`), UNIQUE INDEX `IDX_dcd0c8a4b10af9c986e510b9ec` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `users` CHANGE `subscription_fee` `subscription_fee` decimal(12,2) NOT NULL DEFAULT '0.0'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `available_balance` `available_balance` decimal(12,2) NOT NULL DEFAULT '0.0'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `balance_on_hold` `balance_on_hold` decimal(12,2) NOT NULL DEFAULT '0.0'");
        await queryRunner.query("ALTER TABLE `messages` CHANGE `cost` `cost` decimal(12,2) NOT NULL DEFAULT '0.0'");
        await queryRunner.query("ALTER TABLE `wallet_history` CHANGE `amount` `amount` decimal(12,2) NOT NULL DEFAULT '0.0'");
        await queryRunner.query("ALTER TABLE `wallet_history` CHANGE `fee` `fee` decimal(12,2) NOT NULL DEFAULT '0.0'");
        await queryRunner.query("ALTER TABLE `wallet_ledger` CHANGE `amount` `amount` decimal(12,2) NOT NULL DEFAULT '0.0'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `wallet_ledger` CHANGE `amount` `amount` decimal(12,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `wallet_history` CHANGE `fee` `fee` decimal(12,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `wallet_history` CHANGE `amount` `amount` decimal(12,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `messages` CHANGE `cost` `cost` decimal(12,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `balance_on_hold` `balance_on_hold` decimal(12,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `available_balance` `available_balance` decimal(12,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `subscription_fee` `subscription_fee` decimal(12,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("DROP INDEX `IDX_dcd0c8a4b10af9c986e510b9ec` ON `admin_users`");
        await queryRunner.query("DROP INDEX `IDX_a2fdcf475667ebb48b39f7623c` ON `admin_users`");
        await queryRunner.query("DROP TABLE `admin_users`");
    }

}
