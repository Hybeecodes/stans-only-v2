import { User } from '../../../entities/user.entity';

export class NotificationSettingsResponseDto {
  public enableEmailNotification: boolean;

  public enablePushNotification: boolean;

  constructor(user: User) {
    this.enableEmailNotification = user.emailNotificationStatus;
    this.enablePushNotification = user.pushNotificationStatus;
  }
}
