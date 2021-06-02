import { Module } from '@nestjs/common';
import { AuthEventHandlerService } from './auth-event-handler/auth-event-handler.service';
import { NotificationModule } from '../../../shared/services/notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [AuthEventHandlerService],
  exports: [AuthEventHandlerService],
})
export class ClientEventHandlerModule {}
