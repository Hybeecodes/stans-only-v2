import { ShortUserDto } from '../../users/dtos/short-user.dto';

export class ConversationDto {
  public conversationId: string;
  public conversationType: string;
  public participants: ShortUserDto[];
  public lastMessage: {
    id: number;
    body: string;
    createdAt: Date;
  };

  constructor(conversation: ConversationDto) {
    console.log(conversation.lastMessage);
    this.conversationId = conversation.conversationId;
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
          createdAt: conversation.lastMessage.createdAt,
        }
      : null;
  }
}
