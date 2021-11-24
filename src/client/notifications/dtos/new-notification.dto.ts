import { NotificationType } from '../../../entities/notification.entity';

export class NewNotificationDto {
  recipientId: number;

  recipientUserName: string;

  senderId: number;

  message: string;

  type: NotificationType;

  meta: any;
}
