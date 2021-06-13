import { Module } from '@nestjs/common';
import { AuthEventHandlerService } from './auth-event-handler/auth-event-handler.service';
import { NotificationModule } from '../../../shared/services/notification/notification.module';
import { PostEventHandlerService } from './post-event-handler/post-event-handler.service';
import { PostsModule } from '../../../client/posts/posts.module';

@Module({
  imports: [NotificationModule, PostsModule],
  providers: [AuthEventHandlerService, PostEventHandlerService],
  exports: [AuthEventHandlerService],
})
export class ClientEventHandlerModule {}
