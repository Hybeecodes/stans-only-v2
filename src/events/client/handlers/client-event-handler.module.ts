import { Module } from '@nestjs/common';
import { AuthEventHandlerService } from './auth-event-handler/auth-event-handler.service';
import { NotificationModule } from '../../../shared/services/notification/notification.module';
import { PostEventHandlerService } from './post-event-handler/post-event-handler.service';
import { PostsModule } from '../../../client/posts/posts.module';
import { SubscriptionEventHandlerService } from './subscription-event-handler/subscription-event-handler.service';
import { UsersModule } from '../../../client/users/users.module';

@Module({
  imports: [NotificationModule, PostsModule, UsersModule],
  providers: [
    AuthEventHandlerService,
    PostEventHandlerService,
    SubscriptionEventHandlerService,
  ],
  exports: [AuthEventHandlerService],
})
export class ClientEventHandlerModule {}
