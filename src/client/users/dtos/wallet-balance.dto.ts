import { User } from '../../../entities/user.entity';

export class WalletBalanceDto {
  public availableBalance: number;
  public ledgerBalance: number;
  constructor(user: User) {
    this.availableBalance = user.availableBalance;
    this.ledgerBalance =
      parseFloat(String(user.availableBalance)) +
      parseFloat(String(user.balanceOnHold));
  }
}
