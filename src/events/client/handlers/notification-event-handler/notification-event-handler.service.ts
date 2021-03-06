import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from '../../../../client/notifications/notifications.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from '../../events.enum';
import { NewNotificationDto } from '../../../../client/notifications/dtos/new-notification.dto';
import { WebPushService } from '../../../../shared/services/notifications/web-push/web-push.service';

@Injectable()
export class NotificationEventHandlerService {
  private readonly logger: Logger;

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly webPush: WebPushService,
  ) {
    this.logger = new Logger(NotificationEventHandlerService.name);
  }

  @OnEvent(Events.NEW_NOTIFICATION, { async: true })
  async addUserNotification(
    notificationPayload: NewNotificationDto,
  ): Promise<void> {
    if (notificationPayload.recipientId !== notificationPayload.senderId) {
      await this.notificationsService.addUserNotification(notificationPayload);
      await this.webPush.sendWebPushNotification(
        notificationPayload.recipientId,
        notificationPayload,
      );
    }
  }
}
