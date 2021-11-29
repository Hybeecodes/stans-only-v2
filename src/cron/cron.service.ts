import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Connection } from 'typeorm';
import { LedgerStatus } from '../entities/wallet-ledger.entity';
import { SubscriptionType } from '../entities/user.entity';

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
    SELECT id, amount, user_id FROM wallet_ledger WHERE ledger_status = '${LedgerStatus.ON_HOLD_FOR_SUBSCRIPTION}' AND DATE(created_at) <= DATE(date_sub(NOW(), INTERVAL 7 DAY )) AND is_deleted = false
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

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async updateStansCount() {
    try {
      // get all content creators
      const creators: { id: number }[] = await this.connection.query(
        `SELECT id FROM users WHERE is_deleted = false AND is_content_creator = true AND subscription_type = '${SubscriptionType.PAID}'`,
      );
      this.logger.log('Creators Fetched');
      for (const creator of creators) {
        // get their stans count
        const [{ count }] = await this.connection.query(`
      SELECT COUNT(*) as count FROM subscriptions WHERE subscribee_id = ${creator.id} AND is_deleted = false AND DATE(expiry_date) >= DATE(NOW())
      `);
        const stansCount = Number(count);
        await this.connection.query(
          `UPDATE users SET subscribers_count = ${stansCount} WHERE id = ${creator.id} AND is_deleted = false`,
        );
        this.logger.log('Stans Count Updated');
      }
      this.logger.log('All Stans Count Updated');
    } catch (e) {
      this.logger.error(`updateStansCount Failed: ${JSON.stringify(e)}`);
    }
  }

  onModuleInit(): any {
    this.logger.debug(`${CronService.name} Initialized`);
  }
}
