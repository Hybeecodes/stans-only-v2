import { NotificationType } from '../../../entities/notification.entity';

export class NewNotificationDto {
  recipientId: number;

  senderId: number;

  message: string;

  type: NotificationType;

  meta: any;
}
