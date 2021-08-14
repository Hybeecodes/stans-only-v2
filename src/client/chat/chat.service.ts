import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageRepository } from '../../repositories/message.repository';
import { UsersService } from '../users/users.service';
import { Conversation } from '../../entities/conversation.entity';
import { ChatGateway } from './chat.gateway';
import { NewMessageDto } from './dtos/new-message.dto';

@Injectable()
export class ChatService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(ConversationRepository)
    private readonly conversationRepository: ConversationRepository,
    @InjectRepository(MessageRepository)
    private readonly messageRepository: MessageRepository,
    private readonly usersService: UsersService,
    private readonly chatGateway: ChatGateway,
  ) {
    this.logger = new Logger(this.constructor.name, { timestamp: true });
  }

  async newMessage(
    newMessageDto: NewMessageDto,
    userId: number,
  ): Promise<void> {
    const { conversationId, body, media, recipientId } = newMessageDto;
    const sender = await this.usersService.findUserById(userId);
    const recipient = await this.usersService.findUserById(recipientId);
    try {
      let conversation = await this.conversationRepository.findOne({
        where: { conversationId, isDeleted: false },
      });
      if (!conversation) {
        // create conversation
        conversation = this.conversationRepository.create({
          conversationId,
          participants: [recipient, sender],
        });
        await this.conversationRepository.save(conversation);
      }
      const newMessage = this.messageRepository.create({
        conversation,
        body,
        sender,
        receiver: recipient,
      });
      await this.messageRepository.save(newMessage);
    } catch (e) {
      this.logger.error(`Message Not Sent: ${JSON.stringify(e)}`);
      throw new HttpException(
        '`Message Not Sent',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // async getConversationById(conversationId: string): Promise<Conversation> {}
  //
  // async createConversation(conversationId: string): Promise<Conversation> {}
  //
  // async deleteMessage(messageId: number): Promise<void> {}
}
