import { User } from '../../../entities/user.entity';

export class WalletBalanceDto {
  public availableBalance: number;
  public ledgerBalance: number;
  public canWithdraw: boolean;

  constructor(user: User) {
    this.availableBalance = user.availableBalance;
    this.ledgerBalance =
      parseFloat(String(user.availableBalance)) +
      parseFloat(String(user.balanceOnHold));
    this.canWithdraw = this.availableBalance >= 100;
  }
}
