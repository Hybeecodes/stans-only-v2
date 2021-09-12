import { VerifyBvnDto } from '../dtos/verify-bvn.dto';
import { GetBanksResponseDto } from '../dtos/get-banks-response.dto';
import { VerifyPaymentResponseDto } from '../dtos/verify-payment-response.dto';

export interface IPaymentService {
  verifyBvn(payload: VerifyBvnDto): Promise<boolean>;
  getBanks(payload: any): Promise<GetBanksResponseDto>;
  verifyPayment(
    payload: any,
    userId: number,
  ): Promise<VerifyPaymentResponseDto>;
}
