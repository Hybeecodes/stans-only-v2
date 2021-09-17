import { IPaymentResponse } from './verify-payment-response.dto';

export interface ResolveAccountResponseDto extends IPaymentResponse {
  accountNumber: string;
  accountName: string;
}
