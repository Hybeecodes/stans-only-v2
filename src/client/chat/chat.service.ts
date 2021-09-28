import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageRepository } from '../../repositories/message.repository';
import { UsersService } from '../users/users.service';
import { NewMessageDto } from './dtos/new-message.dto';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { MessageDto } from './dtos/message.dto';
import { ConversationDto } from './dtos/conversation.dto';
import { ChatMediaRepository } from 'src/repositories/chat-media.repository';
import { MessageEventPayload } from './dtos/message-event-payload.dto';
import { Conversation } from '../../entities/conversation.entity';
import { PaymentService } from '../../payment/payment.service';
import { ProcessWalletPaymentDto } from '../users/dtos/process-wallet-payment.dto';
import { TransactionTypes } from '../../entities/transaction.entity';

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
    private readonly paymentService: PaymentService,
  ) {
    this.logger = new Logger(this.constructor.name, { timestamp: true });
  }

  async newMessage(
    newMessageDto: NewMessageDto,
    userId: number,
  ): Promise<MessageEventPayload> {
    const { body, media, recipientId, cost, isPaid } = newMessageDto;
    if (userId === recipientId) {
      this.logger.error(
        `You can not send yourself a message: receiver${recipientId}`,
      );
      throw new HttpException(
        'You can not send yourself a message',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!body && (!media || media.length === 0)) {
      throw new HttpException(
        'Invalid Message Request: No Body',
        HttpStatus.BAD_REQUEST,
      );
    }
    const sender = await this.usersService.findUserById(userId);
    const recipient = await this.usersService.findUserById(recipientId);
    try {
      const response = await this.conversationRepository.query(`
        SELECT DISTINCT conversation_id as conversationId FROM conversations_users
WHERE user_id = ${userId} || user_id = ${recipientId} GROUP BY conversationId HAVING count(*) = 2
      `);
      let conversation: Conversation;
      const conversationId =
        response.length > 0 ? response[0].conversationId : null;
      if (conversationId) {
        conversation = await this.conversationRepository.findOne({
          where: { id: conversationId, isDeleted: false },
        });
      } else {
        // create conversation
        conversation = this.conversationRepository.create({
          participants: [recipient, sender],
        });
        await this.conversationRepository.save(conversation);
      }
      const newMessage = this.messageRepository.create({
        conversation,
        body,
        sender,
        receiver: recipient,
        isPaid,
        cost,
        canView: !isPaid,
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
      await this.conversationRepository.query(
        `UPDATE conversations SET last_message_id = ${saveMessage.id} WHERE id = ${conversation.id}`,
      );
      const message = await this.messageRepository.findOne({
        where: { id: newMessage.id, isDeleted: false },
        relations: ['media', 'sender', 'receiver'],
      });
      return new MessageEventPayload(message, conversationId);
    } catch (e) {
      this.logger.error(`Message Not Sent: ${JSON.stringify(e)}`);
      throw new HttpException(
        '`Message Not Sent',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMesssagesByConversationId(
    userId: number,
    conversationId: number,
    queryData: BaseQueryDto,
  ): Promise<{ count: number; messages: MessageDto[] }> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, isDeleted: false },
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
        .where(`message.conversation_id = ${conversation.id}`)
        .andWhere('message.is_deleted = false')
        .orderBy('message.created_at', 'DESC')
        .offset(offset || 0)
        .limit(limit || 10)
        .getManyAndCount();
      return {
        count,
        messages: messages.map((message) => {
          return new MessageDto(message, userId);
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
      console.log('conversations', conversationIds);
      const [conversations, count] = await this.conversationRepository
        .createQueryBuilder('conversation')
        .leftJoinAndSelect('conversation.participants', 'participant')
        .leftJoinAndSelect('conversation.lastMessage', 'lastMessage')
        .where(
          `conversation.id IN (${
            conversationIds.length > 0 ? conversationIds.join(',') : 0
          })`,
        )
        .andWhere('conversation.is_deleted = false')
        .orderBy('lastMessage.created_at', 'DESC')
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

  async getAllUserConversationIds(userId: number): Promise<number[]> {
    try {
      const conversations = await this.conversationRepository.query(
        `SELECT id FROM conversations c JOIN conversations_users cu ON c.id = cu.conversation_id WHERE cu.user_id = ${userId}`,
      );
      return conversations.map((conversation) => {
        return conversation.id;
      });
    } catch (error) {
      this.logger.error(
        `getAllUserConversationIds Failed: ${JSON.stringify(error)}`,
      );
      throw new HttpException(
        '`Unable to Fetch User Conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async readConversationMessages(conversationId: number): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, isDeleted: false },
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

  async getUserUnreadMessageCount(userId: number): Promise<number> {
    try {
      const [{ count }] = await this.messageRepository.query(
        `SELECT COUNT(*) AS count FROM messages WHERE receiver_id = ${userId} AND is_read is false`,
      );
      return count as number;
    } catch (error) {
      this.logger.error(
        `getUserUnreadMessageCount Failed: ${JSON.stringify(error)}`,
      );
      throw new HttpException(
        '`Unable to Fetch Unread Messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getConversationWithUser(
    userId: number,
    userName: string,
    queryData: BaseQueryDto,
  ): Promise<{ count: number; messages: MessageDto[] }> {
    const user2 = await this.usersService.getUserByUsername(userName);
    if (!user2) {
      throw new HttpException('Invalid Username', HttpStatus.BAD_REQUEST);
    }
    const response = await this.conversationRepository.query(`
        SELECT DISTINCT conversation_id as conversationId FROM conversations_users
WHERE user_id = ${userId} || user_id = ${user2.id} GROUP BY conversationId HAVING count(*) = 2
      `);
    const conversationId =
      response.length > 0 ? response[0].conversationId : null;
    if (!conversationId) return { count: 0, messages: [] };
    try {
      const { offset, limit } = queryData;
      const [messages, count] = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.receiver', 'receiver')
        .leftJoinAndSelect('message.sender', 'sender')
        .leftJoinAndSelect('message.media', 'media')
        .where(`message.conversation_id = ${conversationId}`)
        .andWhere('message.is_deleted = false')
        .orderBy('message.created_at', 'DESC')
        .offset(offset || 0)
        .limit(limit || 10)
        .getManyAndCount();
      return {
        count,
        messages: messages.map((message) => {
          return new MessageDto(message, userId);
        }),
      };
    } catch (e) {
      this.logger.error(
        `getConversationWithUser Failed: ${JSON.stringify(e.message)}`,
      );
      throw new HttpException(
        'Unable to Fetch Conversation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async payForMessage(userId: number, messageId: number): Promise<void> {
    const user = await this.usersService.findUserById(userId);
    const message = await this.messageRepository.findOne({
      where: { id: messageId, isDeleted: false },
    });
    if (!message) {
      throw new HttpException('message not found', HttpStatus.NOT_FOUND);
    }
    if (!message.isPaid) {
      throw new HttpException(
        'Invalid Operation: message is free',
        HttpStatus.NOT_FOUND,
      );
    }
    if (message.canView) {
      throw new HttpException(
        'Invalid Operation: message has already been paid for',
        HttpStatus.NOT_FOUND,
      );
    }
    const sender = await this.usersService.findUserById(message.senderId);
    if (user.availableBalance < message.cost) {
      this.logger.error(
        `Insufficient wallet balance, please top-up your wallet`,
      );
      throw new HttpException(
        'Insufficient wallet balance, please top-up your wallet',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const paymentPayload = new ProcessWalletPaymentDto();
      paymentPayload.amount = message.cost;
      paymentPayload.type = TransactionTypes.PAY_PER_VIEW_DM;
      paymentPayload.recipientId = sender.id;
      paymentPayload.giverId = userId;
      await this.paymentService.processWalletPayment(paymentPayload);
      message.canView = true;
      await this.messageRepository.save(message);
    } catch (e) {
      this.logger.error(`payForMessage Failed: ${JSON.stringify(e)}`);
      throw new HttpException(
        'Payment Failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
