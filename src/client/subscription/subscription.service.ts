import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionRepository } from '../../repositories/subscription.repository';
import { UsersService } from '../users/users.service';
import { Subscription } from '../../entities/subscription.entity';
import { SubscriptionDto } from './dto/subscription.dto';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from '../../events/client/events.enum';
import { SubscribersDto } from './dto/subscribers.dto';
import { NewNotificationDto } from '../notifications/dtos/new-notification.dto';
import { NotificationType } from '../../entities/notification.entity';

@Injectable()
export class SubscriptionService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(SubscriptionRepository)
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger = new Logger(SubscriptionService.name);
  }

  async createSubscription(
    subscriberId: number,
    subscribeeUserName: string,
  ): Promise<void> {
    const subscribee = await this.usersService.getUserByUsername(
      subscribeeUserName,
    );
    if (subscribee.id === subscriberId)
      throw new HttpException(
        'Invalid Action: You can not Subscribe to yourself',
        HttpStatus.FORBIDDEN,
      );
    const subscriber = await this.usersService.findUserById(subscriberId);
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { subscribee, subscriber },
      });
      if (subscription) {
        if (subscription.isDeleted) {
          await this.subscriptionRepository
            .createQueryBuilder('subscription')
            .update(Subscription)
            .set({
              isDeleted: false,
            })
            .where(
              'subscriber_id = :subscriberId AND subscribee_id = :subscribeeId',
              { subscriberId, subscribeeId: subscribee.id },
            )
            .execute();
        }
      } else {
        const newSubscription = this.subscriptionRepository.create({
          subscribee,
          subscriber,
        });
        await this.subscriptionRepository.save(newSubscription);
      }
      this.eventEmitter.emit(Events.ON_NEW_SUBSCRIPTION, subscribee.id);

      const notification = new NewNotificationDto();
      notification.senderId = subscriberId;
      notification.recipientId = subscribee.id;
      notification.message = `${subscriber.userName} Subscribed to you`;
      notification.type = NotificationType.SUBSCRIPTION;

      this.eventEmitter.emit(Events.NEW_NOTIFICATION, notification);
    } catch (e) {
      this.logger.error(
        `Create Subscription Failed: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Subscription Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeSubscription(
    subscriberId: number,
    subscribeeUserName: string,
  ): Promise<void> {
    const subscriber = await this.usersService.findUserById(subscriberId);
    const subscribee = await this.usersService.getUserByUsername(
      subscribeeUserName,
    );
    if (!subscribee) {
      throw new HttpException(
        'Invalid username Supplied',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { subscribee, subscriber, isDeleted: false },
      });
      console.log(subscription);
      if (subscription) {
        subscription.isDeleted = true;
        await this.subscriptionRepository.save(subscription);
        this.eventEmitter.emit(Events.ON_REMOVE_SUBSCRIPTION, subscribee.id);
      }
    } catch (e) {
      this.logger.error(
        `Remove Subscription Failed: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Subscribe',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserSubscribers(
    userName: string,
    queryData: BaseQueryDto,
  ): Promise<SubscribersDto[]> {
    const user = await this.usersService.getUserByUsername(userName);
    try {
      const { limit, offset } = queryData;
      const subscriptions = await this.subscriptionRepository.find({
        where: { subscribee: user, isDeleted: false },
        relations: ['subscriber'],
        skip: offset || 0,
        take: limit || 10,
      });
      return subscriptions.map((sub) => {
        return new SubscribersDto(sub);
      });
    } catch (e) {
      this.logger.error(
        `GET USER Subscription Failed: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Fetch User Subscribers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllUserSubscriptions(userId: number) {
    try {
      const subscriptions = await this.subscriptionRepository.query(`
      SELECT subscribee_id FROM subscriptions WHERE subscriber_id = ${userId} AND is_deleted = false
      `);
      return subscriptions.map((sub) => {
        return sub.subscribee_id;
      });
    } catch (e) {
      this.logger.error(
        `GET USER Subscriptions Failed: ${JSON.stringify(e.message)}`,
      );
    }
  }

  async getSubscriptionsCount(userId: number) {
    try {
      const [{ count }] = await this.subscriptionRepository.query(`
      SELECT COUNT(*) as count FROM subscriptions WHERE subscriber_id = ${userId} AND is_deleted = false
      `);
      return Number(count);
    } catch (e) {
      this.logger.error(
        `GET USER Subscriptions Count Failed: ${JSON.stringify(e.message)}`,
      );
    }
  }

  async getSubscribersCount(userId: number) {
    try {
      const [{ count }] = await this.subscriptionRepository.query(`
      SELECT COUNT(*) as count FROM subscriptions WHERE subscribee_id = ${userId} AND is_deleted = false
      `);
      return Number(count);
    } catch (e) {
      this.logger.error(
        `GET USER Subscribers Count Failed: ${JSON.stringify(e.message)}`,
      );
    }
  }

  async getUserSubscriptions(
    userName: string,
    queryData: BaseQueryDto,
  ): Promise<SubscriptionDto[]> {
    const user = await this.usersService.getUserByUsername(userName);
    try {
      const { limit, offset } = queryData;
      const subscriptions = await this.subscriptionRepository.find({
        where: { subscriber: user, isDeleted: false },
        relations: ['subscribee'],
        skip: offset || 0,
        take: limit || 10,
      });
      return subscriptions.map((sub) => {
        return new SubscriptionDto(sub);
      });
    } catch (e) {
      this.logger.error(
        `GET USER Subscription Failed: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Fetch User Subscriptions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
