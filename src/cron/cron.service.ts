import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Connection } from 'typeorm';
import { LedgerStatus } from '../entities/wallet-ledger.entity';

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger: Logger;

  constructor(private connection: Connection) {
    this.logger = new Logger(CronService.name);
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async makePendingWalletBalanceAvailable() {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      this.logger.debug('makePendingWalletBalanceAvailable Cron Starting');
      const ledgerRecords: { id: number; amount: number; user_id: number }[] =
        await this.connection.query(`
    SELECT id, amount, user_id FROM wallet_ledger WHERE ledger_status = '${LedgerStatus.ON_HOLD}' AND DATE(created_at) <= DATE(date_sub(NOW(), INTERVAL 7 DAY )) AND is_deleted = false
    `);
      // iterate through the ledgerRecords
      if (ledgerRecords.length > 0) {
        for (const record of ledgerRecords) {
          // add amount to available balance && deduct amount from balance on hold
          await this.connection.query(
            `UPDATE users SET available_balance = available_balance + ${Number(
              record.amount,
            )} WHERE id = ${record.user_id}`,
          );
          await this.connection.query(
            `UPDATE users SET balance_on_hold = balance_on_hold - ${Number(
              record.amount,
            )} WHERE id = ${record.user_id}`,
          );
          // update ledger status to released
          await this.connection.query(
            `UPDATE wallet_ledger SET ledger_status = '${LedgerStatus.RELEASED}' WHERE id = ${record.id}`,
          );
        }
      }
      await queryRunner.commitTransaction();
      this.logger.debug('makePendingWalletBalanceAvailable Cron Successful');
    } catch (e) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `makePendingWalletBalanceAvailable Cron Job Failed: ${JSON.stringify(
          e,
        )}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  onModuleInit(): any {
    this.logger.debug(`${CronService.name} Initialized`);
  }
}
