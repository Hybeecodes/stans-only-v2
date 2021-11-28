import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../../repositories/user.repository';
import { UserDto } from '../../entities/user.entity';
import { StatusType } from '../../shared/constants/status-type.enum';
import { SuggestUserQueryDto } from './dtos/suggest-user-query.dto';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class SuggestionsService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly subscriptionService: SubscriptionService,
  ) {
    this.logger = new Logger(SuggestionsService.name);
  }

  async suggestUsers(
    userId: number,
    queryInput: SuggestUserQueryDto,
  ): Promise<{ count: number; users: UserDto[] }> {
    try {
      const { offset, limit, subscriptionType } = queryInput;
      const subscribedUsers =
        await this.subscriptionService.getAllUserSubscriptions(userId);
      subscribedUsers.push(userId);
      const builder = this.userRepository
        .createQueryBuilder('user')
        .where(`id NOT IN (${subscribedUsers.join(',')})`)
        .andWhere('is_deleted = false')
        .andWhere(`status = '${StatusType.ACTIVE}'`)
        .andWhere('is_content_creator = true');
      if (subscriptionType) {
        builder.andWhere(`subscription_type = '${subscriptionType}'`);
      }
      const [users, count] = await builder
        .orderBy(`RAND()`)
        .limit(limit || 3)
        .offset(offset || 0)
        .getManyAndCount();
      return {
        count,
        users: users.map((user) => {
          return user.toUserResponse();
        }),
      };
    } catch (e) {
      this.logger.error(`Suggest Users Failed: ${JSON.stringify(e.message)}`);
      throw new HttpException(
        'Unable to Fetch Suggestions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
