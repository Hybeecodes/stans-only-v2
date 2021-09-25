import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationRepository } from '../../repositories/notification.repository';
import { UsersService } from '../users/users.service';
import { NewNotificationDto } from './dtos/new-notification.dto';
import {
  NotificationStatus,
  NotificationType,
} from '../../entities/notification.entity';
import { ConfigService } from '@nestjs/config';
import { NotificationDto } from './dtos/notification.dto';
import { NotificationQueryDto } from './dtos/notification-query.dto';
import { User } from '../../entities/user.entity';
import { toBoolean } from '../../utils/helpers';

@Injectable()
export class NotificationsService {
  private readonly logger: Logger;
  private readonly appBaseUrl: string;

  constructor(
    @InjectRepository(NotificationRepository)
    private readonly notificationRepository: NotificationRepository,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.appBaseUrl = this.configService.get('APP_BASE_URL');
  }

  generateNotificationUrl(notificationType: string): string {
    let url = this.appBaseUrl;
    switch (notificationType) {
      case NotificationType.BOOKMARK:
        url += '';
        break;
      default:
        break;
    }
    return url;
  }

  async addUserNotification(
    notificationPayload: NewNotificationDto,
  ): Promise<void> {
    const { message, meta, recipientId, type, senderId } = notificationPayload;
    const recipient = await this.usersService.findUserById(recipientId);
    const sender = await this.usersService.findUserById(senderId);
    try {
      const newNotification = this.notificationRepository.create({
        meta: JSON.stringify(meta),
        recipient,
        type,
        message,
        sender,
      });
      await this.notificationRepository.save(newNotification);
    } catch (e) {
      this.logger.error(
        `Add User Notification Failed: ${JSON.stringify(e.message)}`,
      );
    }
  }

  async readAllUserNotifications(userId: number): Promise<void> {
    const recipient = await this.usersService.findUserById(userId);
    try {
      await this.notificationRepository.update(
        { recipient },
        { status: NotificationStatus.READ, readDate: new Date() },
      );
    } catch (e) {
      this.logger.error(
        `readAllUserNotifications Failed: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Mark Notifications as Read',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async readUserNotifications(notificationId: number): Promise<void> {
    try {
      await this.notificationRepository.update(
        { id: notificationId },
        { status: NotificationStatus.READ, readDate: new Date() },
      );
    } catch (e) {
      this.logger.error(
        `readAllUserNotifications Failed: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Mark Notifications as Read',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserUnreadNotificationCount(userId: number): Promise<string> {
    try {
      const {
        0: { notificationCount },
      } = await this.notificationRepository.query(
        `SELECT COUNT(id) AS notificationCount FROM  notifications WHERE recipient_id = ${userId} AND status = '${NotificationStatus.UNREAD}' AND is_deleted = false`,
      );
      return notificationCount as string;
    } catch (e) {
      this.logger.error(
        `Unable to Fetch User Notifications: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Fetch User Notifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllUserNotifications(
    userId: number,
    queryInput: NotificationQueryDto,
  ): Promise<{ count: number; notifications: NotificationDto[] }> {
    const recipient = await this.usersService.findUserById(userId);
    const { limit, offset, status, subscription, like, comment, bookmark } =
      queryInput;
    try {
      const whereClause: {
        recipient?: User;
        isDeleted: boolean;
        status?: string;
        type?: string;
      } = { recipient, isDeleted: false };
      if (status) whereClause.status = status;

      let where = `notification.is_deleted = false AND recipient_id = ${userId}`;

      if (status) {
        where += `status = '${status}'`;
      }

      if (
        toBoolean(subscription) ||
        toBoolean(like) ||
        toBoolean(comment) ||
        toBoolean(bookmark)
      ) {
        where += ' AND (';
        let or = false;

        if (toBoolean(subscription)) {
          where += ` ${or ? ' OR' : ''} type = '${
            NotificationType.SUBSCRIPTION
          }'`;
          or = true;
        }
        if (toBoolean(like)) {
          where += ` ${or ? ' OR' : ''} type = '${NotificationType.LIKE}'`;
          or = true;
        }

        if (toBoolean(comment)) {
          where += ` ${or ? ' OR' : ''} type = '${NotificationType.COMMENT}'`;
          or = true;
        }

        if (toBoolean(bookmark)) {
          where += ` ${or ? ' OR' : ''} type = '${NotificationType.BOOKMARK}'`;
        }
        where += ' )';
      }

      const { 0: notifications, 1: count } = await this.notificationRepository
        .createQueryBuilder('notification')
        .leftJoinAndSelect('notification.sender', 'sender')
        .where(where)
        .limit(limit || 10)
        .offset(offset || 0)
        .orderBy('notification.created_at', 'DESC')
        .getManyAndCount();
      // const { 0: notifications, 1: count } =
      //   await this.notificationRepository.findAndCount({
      //     where: { ...whereClause },
      //     relations: ['sender'],
      //     take: limit || 10,
      //     skip: offset || 0,
      //     order: { createdAt: 'DESC' },
      //   });
      return {
        count,
        notifications: notifications.map((n) => {
          return new NotificationDto(n);
        }),
      };
    } catch (e) {
      console.log(e);
      this.logger.error(
        `getAllUserNotifications Failed: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Fetch Notifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
