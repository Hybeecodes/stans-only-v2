import { Subscription } from '../../../entities/subscription.entity';

export class SubscriptionDto {
  public id: number;
  public user: {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    profilePictureUrl: string;
  };
  constructor(subscription: Subscription) {
    this.id = subscription.id;
    this.user = {
      id: subscription.subscribee.id,
      firstName: subscription.subscribee.firstName,
      lastName: subscription.subscribee.lastName,
      userName: subscription.subscribee.userName,
      profilePictureUrl: subscription.subscribee.profilePictureUrl,
    };
  }
}
