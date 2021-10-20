import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { SubscriptionRepository } from '../../repositories/subscription.repository';
import { UsersService } from '../users/users.service';
import { SubscriptionDto } from './dto/subscription.dto';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from '../../events/client/events.enum';
import { SubscribersDto } from './dto/subscribers.dto';
import { NewNotificationDto } from '../notifications/dtos/new-notification.dto';
import { NotificationType } from '../../entities/notification.entity';
import { WalletHistoryRepository } from '../../repositories/wallet-history.repository';
import { WalletLedgerRepository } from '../../repositories/wallet-ledger.repository';
import { TransactionTypes } from '../../entities/transaction.entity';
import { calculateFeeFromAmount } from '../../utils/helpers';
import { PaymentType } from '../../entities/wallet-history.entity';
import { SubscriptionType } from '../../entities/user.entity';

@Injectable()
export class SubscriptionService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(SubscriptionRepository)
    private readonly subscriptionRepository: SubscriptionRepository,
    @InjectRepository(WalletHistoryRepository)
    private readonly walletHistoryRepository: WalletHistoryRepository,
    @InjectRepository(WalletLedgerRepository)
    private readonly walletLedgerRepository: WalletLedgerRepository,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
    private connection: Connection,
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
    if (
      subscribee.subscriptionType === SubscriptionType.PAID &&
      Number(subscriber.availableBalance) < Number(subscribee.subscriptionFee)
    ) {
      this.logger.error(
        `Insufficient wallet balance, please top-up your wallet`,
      );
      throw new HttpException(
        'Insufficient wallet balance, please top-up your wallet',
        HttpStatus.BAD_REQUEST,
      );
    }
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log('starting transaction');
    const subscriptionFee = subscribee.subscriptionFee;
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { subscribee, subscriber },
      });
      let isSubscriptionActive = false;
      if (subscription)
        isSubscriptionActive =
          new Date(subscription.expiryDate).getTime() >= new Date().getTime();
      const promises: any[] = [];
      ///// Subscriber Updates
      if (
        !(subscription && isSubscriptionActive) &&
        subscribee.subscriptionType === SubscriptionType.PAID
      ) {
        const updateAvailableBalance = queryRunner.query(
          `UPDATE users SET available_balance = available_balance - ${subscriptionFee} WHERE id = ${subscriber.id}`,
        );
        const saveSubscriberWalletHistory = queryRunner.query(
          `INSERT INTO wallet_history (user_id, amount, type, payment_type) 
                VALUES (${subscriber.id}, ${subscriptionFee}, '${TransactionTypes.SUBSCRIPTION}', '${PaymentType.DEBIT}')`,
        );
        promises.push(updateAvailableBalance);
        promises.push(saveSubscriberWalletHistory);

        /// Creator Updates
        const fee = calculateFeeFromAmount(subscriptionFee);
        const balance = subscriptionFee - fee;
        const updatePendingBalance = queryRunner.query(
          `UPDATE users SET balance_on_hold =  balance_on_hold + ${balance} WHERE id = ${subscribee.id}`,
        );
        const saveLedgerRecord = queryRunner.query(
          `INSERT INTO wallet_ledger (user_id, amount) 
                VALUES (${subscribee.id}, ${balance})`,
        );
        const saveSubscribeeWalletHistory = queryRunner.query(
          `INSERT INTO wallet_history (user_id, amount, type, fee, initiator_id, payment_type) 
                VALUES (${subscribee.id}, ${subscriptionFee}, '${TransactionTypes.SUBSCRIPTION}', ${fee}, ${subscriber.id}, '${PaymentType.CREDIT}')`,
        );
        promises.push(saveLedgerRecord);
        promises.push(updatePendingBalance);
        promises.push(saveSubscribeeWalletHistory);
      }
      const today = new Date();
      const expiry = new Date(new Date().setDate(today.getDate() + 30));

      let newSub = false;
      if (subscription) {
        if (subscription.isDeleted || !isSubscriptionActive) {
          const updateSubscription = queryRunner.query(
            `UPDATE subscriptions SET is_deleted = 'false', expiry_date = '${expiry.toISOString()}' WHERE id = ${
              subscription.id
            }`,
          );
          newSub = true;
          promises.push(updateSubscription);
        }
      } else {
        const saveSubscription = queryRunner.query(
          `INSERT INTO subscriptions (subscribee_id, subscriber_id, expiry_date) VALUES (${
            subscribee.id
          }, ${subscriber.id}, '${expiry.toISOString()}')`,
        );
        newSub = true;
        promises.push(saveSubscription);
      }

      await Promise.all(promises);
      console.log('Committing transaction');
      await queryRunner.commitTransaction();
      if (newSub) {
        this.eventEmitter.emit(Events.ON_NEW_SUBSCRIPTION, subscribee.id);

        const notification = new NewNotificationDto();
        notification.senderId = subscriberId;
        notification.recipientId = subscribee.id;
        notification.message = `${subscriber.userName} Subscribed to you`;
        notification.type = NotificationType.SUBSCRIPTION;
        // TODO:: Send Email to Content Creator about the operation
        this.eventEmitter.emit(Events.NEW_NOTIFICATION, notification);
      }
    } catch (e) {
      console.log('something is here');
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Create Subscription Failed: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Subscription Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      console.log('Releasing transaction');
      await queryRunner.release();
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
      SELECT subscribee_id FROM subscriptions WHERE subscriber_id = ${userId} AND is_deleted = false AND DATE(expiry_date) >= DATE(NOW())
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
