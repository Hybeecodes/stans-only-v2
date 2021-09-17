import { IPaymentResponse } from './verify-payment-response.dto';

export interface GetBanksResponseDto extends IPaymentResponse {
  data: [
    {
      id: number;
      code: string;
      name: string;
    },
  ];
}
