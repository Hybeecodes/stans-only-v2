import { Subscription } from '../../../entities/subscription.entity';

export class SubscribersDto {
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
      id: subscription.subscriber.id,
      firstName: subscription.subscriber.firstName,
      lastName: subscription.subscriber.lastName,
      userName: subscription.subscriber.userName,
      profilePictureUrl: subscription.subscriber.profilePictureUrl,
    };
  }
}
