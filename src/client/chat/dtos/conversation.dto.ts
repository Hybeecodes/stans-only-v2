import { ShortUserDto } from '../../users/dtos/short-user.dto';

export class ConversationDto {
  public conversationId: string;
  public conversationType: string;
  public participants: ShortUserDto[];
  public lastMessageDate: Date;

  constructor(conversation: ConversationDto) {
    this.conversationId = conversation.conversationId;
    this.conversationType = conversation.conversationType;
    console.log(new ShortUserDto(conversation.participants[0]));
    this.participants =
      conversation.participants &&
      conversation.participants.map((participant) => {
        return new ShortUserDto(participant);
      });
    this.lastMessageDate = conversation.lastMessageDate;
  }
}
