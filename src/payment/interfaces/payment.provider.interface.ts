import { VerifyBvnDto } from '../dtos/verify-bvn.dto';
import { GetBanksResponseDto } from '../dtos/get-banks-response.dto';
import { VerifyPaymentResponseDto } from '../dtos/verify-payment-response.dto';
import { ResolveAccountResponseDto } from '../dtos/resolve-account-response.dto';
import { ResolveAccountDto } from '../dtos/resolve-account.dto';
import { BankTransferDto } from '../dtos/bank-transfer.dto';
import { BankTransferResponseDto } from '../dtos/bank-transfer-response.dto';

export interface IPaymentProvider {
  verifyBvn(payload: VerifyBvnDto): Promise<boolean>;
  resolveAccount(
    payload: ResolveAccountDto,
  ): Promise<ResolveAccountResponseDto>;
  getBanks(payload: any): Promise<GetBanksResponseDto>;
  verifyPayment(payload: any): Promise<VerifyPaymentResponseDto>;
  initiateBankTransfer(
    payoutPayload: BankTransferDto,
  ): Promise<BankTransferResponseDto>;
}
