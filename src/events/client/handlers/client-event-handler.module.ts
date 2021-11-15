import { Module } from '@nestjs/common';
import { AuthEventHandlerService } from './auth-event-handler/auth-event-handler.service';
import { NotificationModule } from '../../../shared/services/notification/notification.module';
import { PostEventHandlerService } from './post-event-handler/post-event-handler.service';
import { PostsModule } from '../../../client/posts/posts.module';
import { SubscriptionEventHandlerService } from './subscription-event-handler/subscription-event-handler.service';
import { UsersModule } from '../../../client/users/users.module';
import { NotificationEventHandlerService } from './notification-event-handler/notification-event-handler.service';
import { NotificationsModule } from '../../../client/notifications/notifications.module';
import { BlockageEventHandlerService } from './blockage-event-handler/blockage-event-handler.service';
import { WebPushService } from '../../../shared/services/notifications/web-push/web-push.service';

@Module({
  imports: [NotificationModule, PostsModule, UsersModule, NotificationsModule],
  providers: [
    AuthEventHandlerService,
    PostEventHandlerService,
    SubscriptionEventHandlerService,
    NotificationEventHandlerService,
    BlockageEventHandlerService,
    WebPushService,
  ],
  exports: [AuthEventHandlerService],
})
export class ClientEventHandlerModule {}
