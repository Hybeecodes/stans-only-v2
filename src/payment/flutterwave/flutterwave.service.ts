import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { IPaymentService } from '../interfaces/payment.service.interface';
import { HttpService } from '@nestjs/axios';

import * as Flutterwave from 'flutterwave-node-v3';
import { VerifyBvnDto } from '../dtos/verify-bvn.dto';
import { ConfigService } from '@nestjs/config';
import { GetBanksResponseDto } from '../dtos/get-banks-response.dto';
import { VerifyPaymentResponseDto } from '../dtos/verify-payment-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionRepository } from '../../repositories/transaction.repository';
import {
  PaymentProviders,
  TransactionTypes,
} from '../../entities/transaction.entity';
import { UsersService } from '../../client/users/users.service';
import { WalletHistoryRepository } from '../../repositories/wallet-history.repository';
import { ResolveAccountResponseDto } from '../dtos/resolve-account-response.dto';
import { IResolveAccountRequest } from '../interfaces/resolve-account-request.interface';
import { ResolveAccountDto } from '../dtos/resolve-account.dto';

@Injectable()
export class FlutterwaveService implements IPaymentService {
  private readonly logger: Logger;
  private flutterwaveClient: Flutterwave;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(TransactionRepository)
    private readonly transactionRepository: TransactionRepository,
    @InjectRepository(WalletHistoryRepository)
    private readonly walletHistoryRepository: WalletHistoryRepository,
    private readonly usersService: UsersService,
  ) {
    this.logger = new Logger(this.constructor.name);
    this.flutterwaveClient = new Flutterwave(
      this.configService.get<string>('FLUTTERWAVE_PUBLIC_KEY'),
      this.configService.get<string>('FLUTTERWAVE_SECRET_KEY'),
    );
  }

  async resolveAccount(
    payload: ResolveAccountDto,
  ): Promise<ResolveAccountResponseDto> {
    try {
      const requestPayload: IResolveAccountRequest = {
        account_number: payload.accountNumber,
        account_bank: payload.bankCode,
      };
      const response = await this.flutterwaveClient.Misc.verify_Account(
        requestPayload,
      );
      if (response.status !== 'success') {
        throw new HttpException(
          response.message || 'Account Resolution Failed',
          HttpStatus.BAD_REQUEST,
        );
      }
      return new ResolveAccountResponseDto(response.data);
    } catch (e) {
      this.logger.error(`Account Resolution Failed: ${JSON.stringify(e)}`);
      throw new HttpException(
        e.message || 'Account Resolution Failed',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyPayment(payload: any, userId: number): Promise<any> {
    const user = await this.usersService.findUserById(userId);
    try {
      const verifyTransactionPayload = { id: payload.transactionReference };
      const { message, data, status } =
        (await this.flutterwaveClient.Transaction.verify(
          verifyTransactionPayload,
        )) as VerifyPaymentResponseDto;
      if (status === 'success') {
        // log transaction
        const transaction = this.transactionRepository.create({
          transactionId: data.id,
          paymentDate: data.created_at,
          transactionType: TransactionTypes.TOP_UP,
          paymentProvider: PaymentProviders.FLUTTERWAVE,
          amount: data.amount,
          currency: data.currency,
          description: data.narration,
          reference: data.flw_ref,
          meta: JSON.stringify(data),
          user,
        });
        await this.transactionRepository.save(transaction);
        const promises = [];
        // update wallet
        const updateBalance = this.usersService.incrementAvailableBalance(
          userId,
          data.amount,
        );
        promises.push(updateBalance);
        // log wallet history
        const walletHistory = this.walletHistoryRepository.create({
          transaction,
          user,
          amount: data.amount,
        });
        const saveWalletHistory =
          this.walletHistoryRepository.save(walletHistory);
        promises.push(saveWalletHistory);
        await Promise.all(promises);
        return { message };
      } else {
        throw new HttpException(
          message || 'Payment Verification Failed',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (e) {
      this.logger.error(`Payment Verification Failed: ${JSON.stringify(e)}`);
      throw new HttpException(
        e.message || 'Payment verification Failed',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyBvn(payload: VerifyBvnDto): Promise<boolean> {
    try {
      return await this.flutterwaveClient.Misc.bvn(payload);
    } catch (err) {
      this.logger.error(`VerifyBVN Failed: ${JSON.stringify(err)}`);
      throw new HttpException(
        'BVN verification Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getBanks(payload: any): Promise<GetBanksResponseDto> {
    try {
      const response = await this.flutterwaveClient.Bank.country(payload);
      return new GetBanksResponseDto(response);
    } catch (e) {
      this.logger.error(`Get Banks Failed: ${JSON.stringify(e)}`);
      throw new HttpException(
        'Unable to Fetch Banks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
