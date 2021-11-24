import { NotificationType } from '../../../entities/notification.entity';

export class NewNotificationDto {
  recipientId: number;

  recipientUserName: string;

  senderId: number;

  senderUserName: string;

  message: string;

  type: NotificationType;

  meta: any;
}
