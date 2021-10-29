import {MigrationInterface, QueryRunner} from "typeorm";

export class addUploadsCountToUserTable1635487859152 implements MigrationInterface {
    name = 'addUploadsCountToUserTable1635487859152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` ADD `uploads_count` int NOT NULL DEFAULT '0'");
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
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `uploads_count`");
    }

}
