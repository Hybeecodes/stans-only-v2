import { ShortUserDto } from '../../users/dtos/short-user.dto';
import { Conversation } from '../../../entities/conversation.entity';

export class ConversationDto {
  public conversationId: number;
  public conversationType: string;
  public participants: ShortUserDto[];
  public lastMessage: {
    id: number;
    body: string;
    senderId: number;
    receiverId: number;
    isRead: boolean;
    createdAt: Date;
  };

  constructor(conversation: Conversation) {
    this.conversationId = conversation.id;
    this.conversationType = conversation.conversationType;
    this.participants =
      conversation.participants &&
      conversation.participants.map((participant) => {
        return new ShortUserDto(participant);
      });
    this.lastMessage = conversation.lastMessage
      ? {
          id: conversation.lastMessage.id,
          body: conversation.lastMessage.body,
          senderId: conversation.lastMessage.senderId,
          receiverId: conversation.lastMessage.receiverId,
          createdAt: conversation.lastMessage.createdAt,
          isRead: conversation.lastMessage.isRead,
        }
      : null;
  }
}
