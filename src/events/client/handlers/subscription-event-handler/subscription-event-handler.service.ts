import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from '../../events.enum';
import { UsersService } from '../../../../client/users/users.service';

@Injectable()
export class SubscriptionEventHandlerService {
  private readonly logger: Logger;

  constructor(private readonly usersService: UsersService) {
    this.logger = new Logger(SubscriptionEventHandlerService.name);
  }

  @OnEvent(Events.ON_NEW_SUBSCRIPTION, { async: true })
  async onSubscriberHandler(userId: number): Promise<void> {
    try {
      await this.usersService.incrementUserSubscribers(userId);
    } catch (e) {
      this.logger.error(`onNewSubscriptionHandler: ${JSON.stringify(e)}`);
    }
  }

  @OnEvent(Events.ON_REMOVE_SUBSCRIPTION, { async: true })
  async onUnSubscribeHandler(userId: number): Promise<void> {
    try {
      await this.usersService.decrementUserSubscribers(userId);
    } catch (e) {
      this.logger.error(`onUnSubscribeHandler: ${JSON.stringify(e)}`);
    }
  }
}
