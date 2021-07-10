import { Notification } from '../../../entities/notification.entity';

export class NotificationDto {
  public id: number;
  public message: string;
  public status: string;
  public type: string;
  public url: string;
  public readDate: Date;
  public meta: { postId: number };
  public sender: {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    profilePictureUrl: string;
  };
  constructor(notification: Notification) {
    const parsedMeta = JSON.parse(notification.meta);
    this.id = notification.id;
    this.message = notification.message;
    this.status = notification.status;
    this.type = notification.type;
    this.readDate = notification.readDate;
    this.meta = {
      postId: parsedMeta.postId,
    };
    this.sender = {
      id: notification.sender.id,
      firstName: notification.sender.firstName,
      lastName: notification.sender.lastName,
      userName: notification.sender.userName,
      profilePictureUrl: notification.sender.profilePictureUrl,
    };
  }
}
