import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { IPaymentProvider } from '../interfaces/payment.provider.interface';
import { HttpService } from '@nestjs/axios';

import * as Flutterwave from 'flutterwave-node-v3';
import { VerifyBvnDto } from '../dtos/verify-bvn.dto';
import { ConfigService } from '@nestjs/config';
import { GetBanksResponseDto } from '../dtos/get-banks-response.dto';
import { VerifyPaymentResponseDto } from '../dtos/verify-payment-response.dto';
import { ResolveAccountResponseDto } from '../dtos/resolve-account-response.dto';
import { IResolveAccountRequest } from '../interfaces/resolve-account-request.interface';
import { ResolveAccountDto } from '../dtos/resolve-account.dto';
import { BankTransferDto } from '../dtos/bank-transfer.dto';
import { BankTransferResponseDto } from '../dtos/bank-transfer-response.dto';

@Injectable()
export class FlutterwaveService implements IPaymentProvider {
  private readonly logger: Logger;
  private flutterwaveClient: Flutterwave;
  private prodFlutterwaveClient: Flutterwave;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger(this.constructor.name);
    this.flutterwaveClient = new Flutterwave(
      this.configService.get<string>('FLUTTERWAVE_PUBLIC_KEY'),
      this.configService.get<string>('FLUTTERWAVE_SECRET_KEY'),
    );

    this.prodFlutterwaveClient = new Flutterwave(
      this.configService.get<string>('FLUTTERWAVE_PUBLIC_KEY_PROD'),
      this.configService.get<string>('FLUTTERWAVE_SECRET_KEY_PROD'),
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
      const response = await this.prodFlutterwaveClient.Misc.verify_Account(
        requestPayload,
      );
      if (response.status !== 'success') {
        throw new HttpException(
          response.message || 'Account Resolution Failed',
          HttpStatus.BAD_REQUEST,
        );
      }
      return response.data as ResolveAccountResponseDto;
    } catch (e) {
      this.logger.error(`Account Resolution Failed: ${JSON.stringify(e)}`);
      throw new HttpException(
        e.message || 'Account Resolution Failed',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyPayment(
    transactionId: number,
  ): Promise<VerifyPaymentResponseDto> {
    try {
      const verifyTransactionPayload = { id: transactionId };
      return this.flutterwaveClient.Transaction.verify(
        verifyTransactionPayload,
      ) as VerifyPaymentResponseDto;
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
      return response as GetBanksResponseDto;
    } catch (e) {
      this.logger.error(`Get Banks Failed: ${JSON.stringify(e)}`);
      throw new HttpException(
        'Unable to Fetch Banks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async initiateBankTransfer(
    payoutPayload: BankTransferDto,
  ): Promise<BankTransferResponseDto> {
    try {
      return this.flutterwaveClient.Transfer.initiate(
        payoutPayload,
      ) as BankTransferResponseDto;
    } catch (e) {}
  }
}
