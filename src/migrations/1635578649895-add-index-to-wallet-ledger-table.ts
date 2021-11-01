import {MigrationInterface, QueryRunner} from "typeorm";

export class addIndexToWalletLedgerTable1635578649895 implements MigrationInterface {
    name = 'addIndexToWalletLedgerTable1635578649895'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` CHANGE `subscription_fee` `subscription_fee` decimal(12,2) NOT NULL DEFAULT '0.0'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `available_balance` `available_balance` decimal(12,2) NOT NULL DEFAULT '0.0'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `balance_on_hold` `balance_on_hold` decimal(12,2) NOT NULL DEFAULT '0.0'");
        await queryRunner.query("ALTER TABLE `messages` CHANGE `cost` `cost` decimal(12,2) NOT NULL DEFAULT '0.0'");
        await queryRunner.query("ALTER TABLE `wallet_history` CHANGE `amount` `amount` decimal(12,2) NOT NULL DEFAULT '0.0'");
        await queryRunner.query("ALTER TABLE `wallet_history` CHANGE `fee` `fee` decimal(12,2) NOT NULL DEFAULT '0.0'");
        await queryRunner.query("ALTER TABLE `wallet_ledger` CHANGE `amount` `amount` decimal(12,2) NOT NULL DEFAULT '0.0'");
        await queryRunner.query("CREATE INDEX `idx_ledger_status` ON `wallet_ledger` (`ledger_status`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `idx_ledger_status` ON `wallet_ledger`");
        await queryRunner.query("ALTER TABLE `wallet_ledger` CHANGE `amount` `amount` decimal(12,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `wallet_history` CHANGE `fee` `fee` decimal(12,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `wallet_history` CHANGE `amount` `amount` decimal(12,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `messages` CHANGE `cost` `cost` decimal(12,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `balance_on_hold` `balance_on_hold` decimal(12,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `available_balance` `available_balance` decimal(12,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `subscription_fee` `subscription_fee` decimal(12,2) NOT NULL DEFAULT '0.00'");
    }

}
