import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageRepository } from '../../repositories/message.repository';
import { UsersService } from '../users/users.service';
import { NewMessageDto } from './dtos/new-message.dto';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { MessageDto } from './dtos/message.dto';
import { ConversationDto } from './dtos/conversation.dto';

@Injectable()
export class ChatService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(ConversationRepository)
    private readonly conversationRepository: ConversationRepository,
    @InjectRepository(MessageRepository)
    private readonly messageRepository: MessageRepository,
    private readonly usersService: UsersService, // private readonly chatGateway: ChatGateway,
  ) {
    this.logger = new Logger(this.constructor.name, { timestamp: true });
  }

  async newMessage(
    newMessageDto: NewMessageDto,
    userId: number,
    conversationId: string,
  ): Promise<void> {
    const { body, media, recipientId } = newMessageDto;
    if (!body && (!media || media.length === 0)) {
      throw new HttpException(
        'Invalid Message Request: No Body',
        HttpStatus.BAD_REQUEST,
      );
    }
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
        body: body || '',
        sender,
        receiver: recipient,
      });
      const saveMessage = this.messageRepository.save(newMessage);
      const updateConversationLastMessageDate =
        this.conversationRepository.query(
          `UPDATE conversations SET last_message_date = '${new Date().toISOString()}'`,
        );
      await Promise.all([saveMessage, updateConversationLastMessageDate]);
    } catch (e) {
      this.logger.error(`Message Not Sent: ${JSON.stringify(e)}`);
      throw new HttpException(
        '`Message Not Sent',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMesssagesByConversationId(
    conversationId: string,
    queryData: BaseQueryDto,
  ): Promise<{ count: number; messages: MessageDto[] }> {
    const conversation = await this.conversationRepository.findOne({
      where: { conversationId, isDeleted: false },
    });
    if (!conversation) {
      throw new HttpException('Conversation Not Found', HttpStatus.NOT_FOUND);
    }
    try {
      const { offset, limit } = queryData;
      const [messages, count] = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.receiver', 'receiver')
        .leftJoinAndSelect('message.sender', 'sender')
        .where(`message.conversation_id = '${conversation.id}'`)
        .andWhere('message.is_deleted = false')
        .orderBy('message.created_at', 'DESC')
        .offset(offset || 0)
        .limit(limit || 10)
        .getManyAndCount();
      return {
        count,
        messages: messages.map((message) => {
          return new MessageDto(message);
        }),
      };
    } catch (e) {
      this.logger.error(
        `Get Conversation Messages Failed: ${JSON.stringify(e)}`,
      );
      throw new HttpException(
        '`Unable to Fetch Conversation Messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserConversations(
    userId: number,
    queryData: BaseQueryDto,
  ): Promise<{ count: number; conversations: ConversationDto[] }> {
    try {
      const { offset, limit } = queryData;
      const [conversations, count] = await this.conversationRepository
        .createQueryBuilder('conversation')
        .leftJoinAndSelect('conversation.participants', 'participants')
        .orderBy('conversation.last_message_date', 'DESC')
        .offset(offset || 0)
        .limit(limit || 10)
        .getManyAndCount();
      console.log(conversations);
      return {
        count,
        conversations: conversations.map((conversation) => {
          return new ConversationDto(conversation);
        }),
      };
    } catch (e) {
      this.logger.error(`Get User Conversations Failed: ${JSON.stringify(e)}`);
      throw new HttpException(
        '`Unable to Fetch User Conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async readConversationMessages(conversationId: string): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { conversationId, isDeleted: false },
    });
    if (!conversation) {
      throw new HttpException('Conversation Not Found', HttpStatus.NOT_FOUND);
    }
    try {
      await this.messageRepository.query(`
      UPDATE messages SET is_read = true WHERE conversation_id = '${conversation.id}'
      `);
    } catch (e) {
      this.logger.error(`Read Messages Failed: ${JSON.stringify(e)}`);
      throw new HttpException(
        '`Unable to Read Messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteMessage(messageId: number): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, isDeleted: false },
    });
    if (!message) {
      throw new HttpException('Message Not Found', HttpStatus.NOT_FOUND);
    }
    try {
      message.isDeleted = true;
      await this.messageRepository.save(message);
    } catch (e) {
      this.logger.error(`Delete Message Failed: ${JSON.stringify(e)}`);
      throw new HttpException(
        '`Unable to Delete Message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}