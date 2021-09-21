import { IPaymentResponse } from './verify-payment-response.dto';

export interface BankTransferResponseDto extends IPaymentResponse {
  data: {
    id: number;
    account_number: string;
    bank_code: string;
    full_name: string;
    created_at: Date;
    currency: string;
    debit_currency: string;
    amount: number;
    fee: number;
    status: string;
    reference: string;
    meta: null;
    narration: string;
    complete_message: string;
    requires_approval: number;
    is_approved: boolean;
    bank_name: string;
  };
}
