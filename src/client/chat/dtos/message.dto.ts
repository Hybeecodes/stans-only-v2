import { Message } from '../../../entities/message.entity';

export class MessageDto {
  public id: number;
  public body: string;
  public senderId: number;
  public recipientId: number;
  public isRead: boolean;
  public createdAt: Date;
  constructor(message: Message) {
    this.id = message.id;
    this.body = message.body;
    this.senderId = message.sender.id;
    this.recipientId = message.receiver.id;
    this.isRead = message.isRead;
    this.createdAt = message.createdAt;
  }
}
