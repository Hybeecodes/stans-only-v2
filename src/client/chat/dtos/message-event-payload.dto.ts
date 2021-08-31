import { Message } from '../../../entities/message.entity';

export class MessageEventPayload {
  public id: number;
  public body: string;
  public sender: {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    profilePictureUrl: string;
  };
  public recipientId: number;
  public senderId: number;
  public media: { url: string; mediaType: string }[];
  public conversationId: string;
  public isRead: boolean;
  public createdAt: Date;
  constructor(message: Message, conversationId: string) {
    this.id = message.id;
    this.body = message.body;
    this.sender = {
      id: message.sender.id,
      firstName: message.sender.firstName,
      lastName: message.sender.lastName,
      userName: message.sender.userName,
      profilePictureUrl: message.sender.profilePictureUrl,
    };
    this.recipientId = message.receiver.id;
    this.senderId = message.sender.id;
    this.media =
      message.media &&
      message.media.map((m) => {
        return {
          url: m.url,
          mediaType: m.mediaType,
        };
      });
    this.conversationId = conversationId;
    this.isRead = message.isRead;
    this.createdAt = message.createdAt;
  }
}
