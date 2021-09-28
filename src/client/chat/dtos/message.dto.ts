import { Message } from '../../../entities/message.entity';

export class MessageDto {
  public id: number;
  public body: string;
  public senderId: number;
  public recipientId: number;
  public media: { url: string; mediaType: string }[];
  public isRead: boolean;
  public isPaid: boolean;
  public canView: boolean;
  public cost: number;
  public createdAt: Date;
  constructor(message: Message, userId: number) {
    const isRecipient = userId === message.receiver.id;
    this.id = message.id;
    this.body = message.body;
    this.senderId = message.sender.id;
    this.recipientId = message.receiver.id;
    this.isPaid = message.isPaid;
    this.canView = message.canView;
    this.cost = message.cost;
    this.media =
      message.media &&
      message.media.map((m) => {
        return {
          url: !isRecipient || this.canView ? m.url : null,
          mediaType: m.mediaType,
        };
      });
    this.isRead = message.isRead;
    this.createdAt = message.createdAt;
  }
}
