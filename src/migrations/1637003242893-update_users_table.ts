import {MigrationInterface, QueryRunner} from "typeorm";

export class updateUsersTable1637003242893 implements MigrationInterface {
    name = 'updateUsersTable1637003242893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `has_reset_password`");
        await queryRunner.query("ALTER TABLE `users` ADD `last_login` datetime NULL");
        await queryRunner.query("ALTER TABLE `users` ADD `is_suspended` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `users` ADD `should_rest_password` tinyint NOT NULL DEFAULT 0");
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
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `should_rest_password`");
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `is_suspended`");
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `last_login`");
        await queryRunner.query("ALTER TABLE `users` ADD `has_reset_password` tinyint NOT NULL DEFAULT '0'");
    }

}
