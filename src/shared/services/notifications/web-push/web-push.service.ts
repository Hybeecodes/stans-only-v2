import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../../../../client/users/users.service';
import * as webpush from 'web-push';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebPushService {
  private readonly logger: Logger;
  private readonly publicKey: string;
  private readonly privateKey: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger(this.constructor.name);
    this.publicKey = this.configService.get<string>('WEB_PUSH_PUBLIC_KEY');
    this.privateKey = this.configService.get<string>('WEB_PUSH_PRIVATE_KEY');
    webpush.setVapidDetails(
      'mailto:noreply@stansonly.com',
      this.publicKey,
      this.privateKey,
    );
  }

  async sendWebPushNotification(userId: number, notificationObj) {
    try {
      const { subscription, isPushNotificationEnabled } =
        await this.usersService.getWebPushNotification(userId);
      if (!isPushNotificationEnabled) {
        this.logger.log('Push Notification is Disabled for user');
        return;
      }
      console.log(subscription);
      await webpush.sendNotification(
        subscription,
        JSON.stringify(notificationObj),
      );
      this.logger.log('Web Push Notification Sent');
    } catch (e) {
      this.logger.error(`sendWebPushNotification Failed: ${JSON.stringify(e)}`);
    }
  }
}
