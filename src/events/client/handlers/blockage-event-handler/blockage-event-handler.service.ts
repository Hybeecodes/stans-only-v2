import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../../../../client/users/users.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from '../../events.enum';

@Injectable()
export class BlockageEventHandlerService {
  private readonly logger: Logger;

  constructor(private readonly usersService: UsersService) {
    this.logger = new Logger(BlockageEventHandlerService.name);
  }

  @OnEvent(Events.ON_NEW_USER_BLOCK, { async: true })
  async onBlockUserHandler(userId: number): Promise<void> {
    try {
      await this.usersService.incrementBlockedUsers(userId);
    } catch (e) {
      this.logger.error(`onBlockUserHandler: ${JSON.stringify(e)}`);
    }
  }

  @OnEvent(Events.ON_USER_UNBLOCK, { async: true })
  async onUnBlockUserHandler(userId: number): Promise<void> {
    try {
      await this.usersService.decrementBlockedUsers(userId);
    } catch (e) {
      this.logger.error(`onUnBlockUserHandler: ${JSON.stringify(e)}`);
    }
  }
}
