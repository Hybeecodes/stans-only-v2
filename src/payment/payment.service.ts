import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionRepository } from '../repositories/transaction.repository';
import { WalletHistoryRepository } from '../repositories/wallet-history.repository';
import { UsersService } from '../client/users/users.service';
import { ResolveAccountDto } from './dtos/resolve-account.dto';
import { ResolveAccountResponseDto } from './dtos/resolve-account-response.dto';
import { PaymentProviderFactory } from './factories/payment-provider.factory';
import {
  PaymentProviders,
  PaymentStatus,
  TransactionTypes,
} from '../entities/transaction.entity';
import { CompleteTopUpTransactionDto } from './dtos/complete-top-up-transaction.dto';
import { Connection } from 'typeorm';
import { InitiateTopUpTransactionDto } from './dtos/initiate-top-up-transaction.dto';
import { FetchBanksQueryDto } from './dtos/fetch-banks-query.dto';
import { WithdrawalDto } from './dtos/withdrawal.dto';
import { BankTransferDto } from './dtos/bank-transfer.dto';
import { BankService } from '../client/bank/bank.service';
import { ConfigService } from '@nestjs/config';
import { WalletHistoryDto } from './dtos/wallet-history.dto';
import { ProcessWalletPaymentDto } from '../client/users/dtos/process-wallet-payment.dto';
import { calculateFeeFromAmount } from '../utils/helpers';
import { PaymentType } from '../entities/wallet-history.entity';
import { LedgerStatus } from '../entities/wallet-ledger.entity';
import { GetWalletHistoryQueryDto } from './dtos/get-wallet-history-query.dto';

@Injectable()
export class PaymentService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(TransactionRepository)
    private readonly transactionRepository: TransactionRepository,
    @InjectRepository(WalletHistoryRepository)
    private readonly walletHistoryRepository: WalletHistoryRepository,
    private readonly usersService: UsersService,
    private readonly bankService: BankService,
    private readonly paymentProviderFactory: PaymentProviderFactory,
    private readonly connection: Connection,
    private readonly config: ConfigService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async resolveAccount(
    payload: ResolveAccountDto,
  ): Promise<ResolveAccountResponseDto> {
    const paymentProvider = this.paymentProviderFactory.findOne(
      PaymentProviders.FLUTTERWAVE,
    );
    return paymentProvider.resolveAccount(payload);
  }

  async initiateTopUpTransaction(
    payload: InitiateTopUpTransactionDto,
    userId: number,
  ): Promise<void> {
    const user = await this.usersService.findUserById(userId);
    const { reference } = payload;
    try {
      const transaction = this.transactionRepository.create({
        user,
        reference,
      });
      await this.transactionRepository.save(transaction);
    } catch (e) {
      this.logger.error(`Initiate Top up Transaction Failed`);
      throw new HttpException(
        'Withdrawal failed, please try again later',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async completeTopUpTransaction(
    payload: CompleteTopUpTransactionDto,
    userId: number,
  ): Promise<{ message: string }> {
    const { transactionId, reference } = payload;
    await this.usersService.findUserById(userId);
    // find the initiated transaction
    const transaction = await this.transactionRepository.findOne({
      where: { reference, isDeleted: false, paymentStatus: PaymentStatus.NEW },
    });
    if (!transaction) {
      throw new HttpException(
        'Transaction Record Not Found',
        HttpStatus.NOT_FOUND,
      );
    }
    const queryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const paymentProvider = this.paymentProviderFactory.findOne(
        PaymentProviders.FLUTTERWAVE,
      );
      const { status, data, message } = await paymentProvider.verifyPayment(
        transactionId,
      );
      if (status === 'success') {
        // update transaction log
        await queryRunner.startTransaction();
        await this.connection.query(
          `
          UPDATE transactions
           SET
          transaction_id = ${data.id},
          payment_date = '${data.created_at}',
          transaction_type = '${TransactionTypes.TOP_UP}',
          payment_provider = '${PaymentProviders.FLUTTERWAVE}',
          amount = '${data.amount}',
          currency = '${data.currency}',
          description = '${data.narration}',
          transaction_reference = '${data.flw_ref}',
          meta = '${JSON.stringify(data)}',
          payment_status = '${PaymentStatus.COMPLETED}'
          WHERE reference = '${reference}' AND user_id = ${userId} AND is_deleted = false
        `,
        );
        // update wallet
        await this.usersService.incrementAvailableBalance(userId, data.amount);
        queryRunner.query(
          `INSERT INTO wallet_history (user_id, amount, type, payment_type) 
                VALUES (${userId}, ${data.amount}, '${TransactionTypes.TOP_UP}', '${PaymentType.CREDIT}')`,
        );
        queryRunner.commitTransaction();
        return { message: 'Wallet Top-up Successful' };
      } else {
        throw new HttpException(
          message || 'Payment Verification Failed',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (e) {
      queryRunner.rollbackTransaction();
      this.logger.error(`Wallet Top Up Failed: ${JSON.stringify(e)}`);
      throw new HttpException(
        e.message || 'Wallet Top Up Failed',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchBanks(payload: FetchBanksQueryDto) {
    const paymentProvider = this.paymentProviderFactory.findOne(
      PaymentProviders.FLUTTERWAVE,
    );
    return paymentProvider.getBanks(payload);
  }

  async initiateWithdrawal(payload: WithdrawalDto, userId: number) {
    const { amount } = payload;
    const user = await this.usersService.findUserById(userId);
    if (user.isWalletLocked) {
      this.logger.log(
        'User tried to initiate another withdrawal when one is already in progress: [Fraud Alert]',
      );
      throw new HttpException(
        'Please hold on, you have a pending withdrawal',
        HttpStatus.FORBIDDEN,
      );
    }

    if (user.availableBalance < amount) {
      throw new HttpException(
        'Sorry, insufficient wallet balance',
        HttpStatus.BAD_REQUEST,
      );
    }
    const bank = await this.bankService.getBankById(user, payload.accountId);
    const reference = `WITH_${Date.now()}`;
    // log withdrawal transaction
    const transaction = this.transactionRepository.create({
      user,
      paymentStatus: PaymentStatus.NEW,
      reference,
      paymentProvider: PaymentProviders.FLUTTERWAVE,
      amount,
      transactionType: TransactionTypes.WITHDRAWAL,
      description: 'Withdrawal From Wallet',
      currency: 'NGN',
      paymentDate: new Date().toISOString(),
    });
    const queryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(transaction);
      await queryRunner.query(
        `UPDATE users SET available_balance = available_balance - ${amount}, balance_on_hold = balance_on_hold + ${amount}, is_wallet_locked = true WHERE id = ${userId} AND is_deleted = false`,
      );
      await queryRunner.query(
        `INSERT INTO wallet_ledger (user_id, amount, transaction_reference, ledger_status) VALUES(${userId}, ${amount}, '${reference}', '${LedgerStatus.ON_HOLD_FOR_WITHDRAWAL}')`,
      );
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Payout Initiation Failed: ${JSON.stringify(e)}`);
      throw new HttpException(
        'Unable to Initiate Payout',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
    try {
      const transferPayload: BankTransferDto = {
        amount,
        account_bank: bank.bankCode,
        account_number: bank.accountNumber,
        currency: 'NGN',
        narration: 'Withdrawal From Wallet',
        reference,
        debit_currency: 'NGN',
        callback_url: `${this.config.get(
          'API_URL',
        )}/api/stans-only-api/v1/payment/complete-transfer`,
      };
      console.log(transferPayload);
      const paymentProvider = this.paymentProviderFactory.findOne(
        PaymentProviders.FLUTTERWAVE,
      );
      await paymentProvider.initiateBankTransfer(transferPayload);
    } catch (e) {
      await queryRunner.query(
        `UPDATE users SET available_balance = available_balance + ${amount}, balance_on_hold = balance_on_hold - ${amount}, is_wallet_locked = false WHERE id = ${userId} AND is_deleted = false`,
      );
      await queryRunner.query(
        `UPDATE wallet_ledger SET ledger_status = '${LedgerStatus.RELEASED}' WHERE user_id = ${userId} AND transaction_reference = '${reference}'`,
      );
    }
  }

  async completeWithdrawal(payload: any): Promise<boolean> {
    const queryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      const {
        data: { reference, status, complete_message, amount },
      } = payload;
      await queryRunner.startTransaction();
      const transaction = await this.transactionRepository.findOne({
        where: {
          reference,
          amount,
          isDeleted: false,
          transactionType: TransactionTypes.WITHDRAWAL,
          paymentStatus: PaymentStatus.NEW,
        },
        relations: ['user'],
      });
      if (!transaction) {
        this.logger.error(
          `Invalid Operation: Transaction With reference ${reference} does not exist`,
        );
        return false;
      }
      const userId = transaction.user.id;
      transaction.paymentStatus = status;
      transaction.paymentProviderResponseMessage = complete_message;
      transaction.meta = JSON.stringify(payload.data);
      await queryRunner.manager.save(transaction);
      // update wallet if it was successful
      if (transaction.paymentStatus === PaymentStatus.COMPLETED) {
        await queryRunner.query(
          `INSERT INTO wallet_history (user_id, amount, type) 
                VALUES (${transaction.user.id}, ${amount}, '${TransactionTypes.WITHDRAWAL}')`,
        );
        await queryRunner.query(
          `UPDATE wallet_ledger SET ledger_status = '${LedgerStatus.RELEASED}' WHERE user_id = ${transaction.user.id} AND transaction_reference = '${reference}'`,
        );
        await queryRunner.query(
          `UPDATE users SET balance_on_hold = balance_on_hold - ${amount}, is_wallet_locked = false WHERE id = ${userId} AND is_deleted = false`,
        );
      } else if (transaction.paymentStatus === PaymentStatus.FAILED) {
        await queryRunner.query(
          `UPDATE users SET available_balance = available_balance + ${amount}, balance_on_hold = balance_on_hold - ${amount}, is_wallet_locked = false WHERE id = ${userId} AND is_deleted = false`,
        );
        await queryRunner.query(
          `UPDATE wallet_ledger SET ledger_status = '${LedgerStatus.RELEASED}' WHERE user_id = ${transaction.user.id} AND transaction_reference = '${reference}'`,
        );
      }

      queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Withdrawal Not Completed: ${JSON.stringify(e)}`);
    } finally {
      await queryRunner.release();
    }
  }

  async getWalletTransactionHistory(
    userId: number,
    query: GetWalletHistoryQueryDto,
  ): Promise<any> {
    await this.usersService.findUserById(userId);
    const { offset, limit, transactionType } = query;
    try {
      const builder = this.walletHistoryRepository
        .createQueryBuilder('history')
        .leftJoinAndSelect('history.initiator', 'initiator')
        .where(`history.user_id  = ${userId}`)
        .andWhere('history.is_deleted = false');

      if (transactionType) {
        builder.andWhere(`payment_type = '${transactionType}'`);
      }
      const [walletHistory, count] = await builder
        .limit(limit || 10)
        .offset(offset || 0)
        .orderBy('history.created_at', 'DESC')
        .getManyAndCount();
      return {
        count,
        walletHistory: walletHistory.map(
          (history) => new WalletHistoryDto(history),
        ),
      };
    } catch (e) {
      this.logger.error(
        `getWalletTransactionHistory Failed: ${JSON.stringify(e)}`,
      );
      throw new HttpException(
        'Unable to retrieve wallet transactions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async processWalletPayment(payload: ProcessWalletPaymentDto): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { amount, recipientId, type, giverId } = payload;
    try {
      /** Giver Updates  **/
      const updateGiverAvailableBalance = queryRunner.query(
        `UPDATE users SET available_balance = available_balance - ${amount} WHERE id = ${giverId}`,
      );
      const saveGiverWalletHistory = queryRunner.query(
        `INSERT INTO wallet_history (user_id, amount, type, payment_type) 
                VALUES (${giverId}, ${amount}, '${type}', '${PaymentType.DEBIT}')`,
      );
      const promises: any[] = [
        updateGiverAvailableBalance,
        saveGiverWalletHistory,
      ];
      /** Recipient Updates  **/
      const fee = calculateFeeFromAmount(amount);
      const balance = amount - fee;
      if (type === TransactionTypes.SUBSCRIPTION) {
        const updateRecipientPendingBalance = queryRunner.query(
          `UPDATE users SET balance_on_hold =  balance_on_hold + ${balance} WHERE id = ${recipientId}`,
        );
        const saveRecipientLedgerRecord = queryRunner.query(
          `INSERT INTO wallet_ledger (user_id, amount) 
                VALUES (${recipientId}, ${balance})`,
        );
        promises.push(updateRecipientPendingBalance);
        promises.push(saveRecipientLedgerRecord);
      } else {
        const updateRecipientAvailableBalance = queryRunner.query(
          `UPDATE users SET available_balance =  available_balance + ${balance} WHERE id = ${recipientId}`,
        );
        promises.push(updateRecipientAvailableBalance);
      }

      const saveRecipientWalletHistory = queryRunner.query(
        `INSERT INTO wallet_history (user_id, amount, type, fee, initiator_id, payment_type) 
                VALUES (${recipientId}, ${amount}, '${type}', ${fee}, ${giverId}, '${PaymentType.CREDIT}')`,
      );
      promises.push(saveRecipientWalletHistory);
      await Promise.all(promises);
      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(`Wallet Payment Failed: ${JSON.stringify(e)}`);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
