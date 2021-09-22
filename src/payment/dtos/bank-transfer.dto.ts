export interface BankTransferDto {
  account_bank: string;
  account_number: string;
  amount: number;
  narration: string;
  currency: string;
  reference: string;
  debit_currency: string;
  callback_url: string;
}
