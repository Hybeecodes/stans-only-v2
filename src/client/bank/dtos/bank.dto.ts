import { BankAccount } from '../../../entities/bank-account.entity';

export class BankDto {
  id: number;
  bankName: string;
  bankCode: string;
  accountName: string;
  accountNumber: string;

  constructor(bank: BankAccount) {
    this.bankCode = bank.bankCode;
    this.bankName = bank.bankName;
    this.accountName = bank.accountName;
    this.accountNumber = bank.accountNumber;
  }
}
