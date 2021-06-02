import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from '../../events.enum';
import { User } from '../../../../entities/user.entity';
import { EmailService } from '../../../../shared/services/notification/email/email.service';

@Injectable()
export class AuthEventHandlerService {
  private readonly logger: Logger;
  constructor(private readonly emailService: EmailService) {
    this.logger = new Logger(AuthEventHandlerService.name);
  }

  @OnEvent(Events.ON_REGISTRATION, { async: true })
  async onRegistrationHandler(user: User) {
    try {
      await this.emailService.sendNewUserEmail(user);
    } catch (e) {
      this.logger.error(
        `On Registration Event Handler Failed: ${JSON.stringify(e.message)}`,
      );
    }
  }

  @OnEvent(Events.ON_FORGOT_PASSWORD, { async: true })
  async onForgotPasswordHandler(user: User) {
    try {
      await this.emailService.sendForgotPasswordEmail(user);
    } catch (e) {
      this.logger.error(
        `On Registration Event Handler Failed: ${JSON.stringify(e.message)}`,
      );
    }
  }
}
