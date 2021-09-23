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
        'Unable to Initiate Top up Transaction',
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
          `INSERT INTO wallet_history (user_id, amount, type) 
                VALUES (${userId}, ${data.amount}, '${TransactionTypes.TOP_UP}')`,
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
    const user = await this.usersService.findUserById(userId);
    const userBanks = await this.bankService.fetchUserBanks(userId);
    if (userBanks.length === 0) {
      throw new HttpException(
        'No Bank Account is Associated with this account',
        HttpStatus.BAD_REQUEST,
      );
    }
    const reference = `WITH_${Date.now()}`;
    // log withdrawal transaction
    const defaultBank = userBanks[0];
    const { amount } = payload;
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
    await this.transactionRepository.save(transaction);
    try {
      const transferPayload: BankTransferDto = {
        amount,
        account_bank: defaultBank.bankCode,
        account_number: defaultBank.accountNumber,
        currency: 'NGN',
        narration: 'Withdrawal From Wallet',
        reference: `WITH_${Date.now()}`,
        debit_currency: 'NGN',
        callback_url: `${this.config.get(
          'API_URL',
        )}/api/stans-only-api/v1/payment/complete-transfer`,
      };
      const paymentProvider = this.paymentProviderFactory.findOne(
        PaymentProviders.FLUTTERWAVE,
      );
      await paymentProvider.initiateBankTransfer(transferPayload);
    } catch (e) {
      this.logger.error(`Payout Initiation Failed`);
      throw new HttpException(
        'Unable to Initiate Payout',
        HttpStatus.INTERNAL_SERVER_ERROR,
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
          isDeleted: false,
          transactionType: TransactionTypes.WITHDRAWAL,
          paymentStatus: PaymentStatus.NEW,
        },
        relations: ['user'],
      });
      if (!transaction) {
        this.logger.error(
          `Transaction With reference ${reference} does not exist`,
        );
        return false;
      }
      transaction.paymentStatus = status;
      transaction.paymentProviderResponseMessage = complete_message;
      transaction.meta = JSON.stringify(payload.data);
      await this.transactionRepository.save(transaction);
      // update wallet if it was successful
      await this.usersService.decrementAvailableBalance(
        transaction.user.id,
        amount,
      );
      queryRunner.query(
        `INSERT INTO wallet_history (user_id, amount, type) 
                VALUES (${transaction.user.id}, ${amount}, '${TransactionTypes.WITHDRAWAL}')`,
      );
      queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Withdrawal Not Completed: ${JSON.stringify(e)}`);
    } finally {
      await queryRunner.release();
    }
  }
}
