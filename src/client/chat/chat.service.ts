import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageRepository } from '../../repositories/message.repository';
import { UsersService } from '../users/users.service';
import { NewMessageDto } from './dtos/new-message.dto';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { MessageDto } from './dtos/message.dto';
import { ConversationDto } from './dtos/conversation.dto';
import { ChatGateway } from './chat.gateway';
import { ChatEvents } from './chat-events.enum';
import { MessageEventPayload } from './dtos/message-event-payload.dto';
import { ChatMediaRepository } from 'src/repositories/chat-media.repository';

@Injectable()
export class ChatService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(ConversationRepository)
    private readonly conversationRepository: ConversationRepository,
    @InjectRepository(ChatMediaRepository)
    private readonly chatMediaRepository: ChatMediaRepository,
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
        body,
        sender,
        receiver: recipient,
      });
      const saveMessage = await this.messageRepository.save(newMessage);
      if (media && media.length > 0) {
        for (const { url, mediaType } of media) {
          const postMedia = this.chatMediaRepository.create({
            message: saveMessage,
            url,
            mediaType,
          });
          await this.chatMediaRepository.save(postMedia);
        }
      }
      await
        this.conversationRepository.query(
          `UPDATE conversations SET last_message_date = '${new Date().toISOString()}'`,
        );
        const userRoomName = `userRoom${recipient.userName}`;
        console.log(userRoomName);
      this.chatGateway.wss.to(userRoomName).emit(ChatEvents.NEW_MESSAGE, new MessageEventPayload(newMessage));
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
        .leftJoinAndSelect('message.media', 'media')
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
      const conversationIds = await this.getAllUserConversationIds(userId);
      const [conversations, count] = await this.conversationRepository
        .createQueryBuilder('conversation')
        .leftJoinAndSelect('conversation.participants', 'participant')
        .where(`conversation.id IN (${conversationIds.length > 0? conversationIds.join(','): 0})`)
        .orderBy('conversation.last_message_date', 'DESC')
        .offset(offset || 0)
        .limit(limit || 10)
        .getManyAndCount();
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

  async getAllUserConversationIds(userId: number): Promise<number[]>{
    try {
      const conversations = await this.conversationRepository.query(`SELECT id FROM conversations c JOIN conversations_users cu ON c.id = cu.conversation_id WHERE cu.user_id = ${userId}`);
      const conversationIds = conversations.map((conversation) => {
        return conversation.id;
      });
      return conversationIds;
    } catch (error) {
      this.logger.error(`getAllUserConversationIds Failed: ${JSON.stringify(error)}`);
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
