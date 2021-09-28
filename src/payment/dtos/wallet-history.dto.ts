import {
  PaymentType,
  WalletHistory,
} from '../../entities/wallet-history.entity';
import { TransactionTypes } from '../../entities/transaction.entity';

export class WalletHistoryDto {
  public id: number;
  public amount: number;
  public fee: number;
  public initiator: {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    profilePictureUrl: string;
  };
  public channel: TransactionTypes;
  public type: PaymentType;
  public createdDate: Date;

  constructor(walletHistory: WalletHistory) {
    this.id = walletHistory.id;
    this.amount = walletHistory.amount;
    this.fee = walletHistory.fee;
    this.channel = walletHistory.type;
    this.initiator = walletHistory.initiator && {
      id: walletHistory.initiator.id,
      firstName: walletHistory.initiator.firstName,
      lastName: walletHistory.initiator.lastName,
      userName: walletHistory.initiator.userName,
      profilePictureUrl: walletHistory.initiator.profilePictureUrl,
    };
    this.type = walletHistory.paymentType;
    this.createdDate = walletHistory.createdAt;
  }
}
