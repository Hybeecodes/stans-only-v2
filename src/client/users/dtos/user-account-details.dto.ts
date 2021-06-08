import { User } from '../../../entities/user.entity';

export class UserAccountDetailsDto {
  public userName: string;

  public phoneNumber: string;

  public subscriptionFee: number;

  constructor(user: User) {
    this.userName = user.userName;
    this.phoneNumber = user.phoneNumber;
    this.subscriptionFee = parseInt(String(user.subscriptionFee));
  }
}
