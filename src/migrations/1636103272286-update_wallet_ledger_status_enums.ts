import {MigrationInterface, QueryRunner} from "typeorm";

export class updateWalletLedgerStatusEnums1636103272286 implements MigrationInterface {
    name = 'updateWalletLedgerStatusEnums1636103272286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `wallet_ledger` CHANGE `ledger_status` `ledger_status` enum ('ON_HOLD_FOR_SUBSCRIPTION', 'RELEASED', 'ON_HOLD_FOR_WITHDRAWAL') NOT NULL DEFAULT 'ON_HOLD_FOR_SUBSCRIPTION'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `wallet_ledger` CHANGE `ledger_status` `ledger_status` enum ('ON_HOLD', 'RELEASED') NOT NULL DEFAULT 'ON_HOLD'");
    }

}
