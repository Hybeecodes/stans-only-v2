import { TransactionTypes } from '../../../entities/transaction.entity';

export class ProcessWalletPaymentDto {
  public giverId: number;

  public recipientId: number;

  public amount: number;

  public type: TransactionTypes;
}
