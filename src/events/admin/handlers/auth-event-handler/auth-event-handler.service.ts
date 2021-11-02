import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from '../../../../entities/user.entity';
import { NotificationService } from '../../../../shared/services/notification/notification.service';
import { AdminEvents } from '../../events.enum';

@Injectable()
export class AuthEventHandlerService {
  private readonly logger: Logger;
  constructor(private readonly emailService: NotificationService) {
    this.logger = new Logger(AuthEventHandlerService.name);
  }

  @OnEvent(AdminEvents.ON_NEW_ADMIN_USER, { async: true })
  async onRegistrationHandler(user: User) {
    try {
      await this.emailService.sendNewAdminUserEmail(user);
    } catch (e) {
      this.logger.error(
        `On Registration Event Handler Failed: ${JSON.stringify(e.message)}`,
      );
    }
  }
}
