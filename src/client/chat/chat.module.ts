import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageRepository } from '../../repositories/message.repository';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { UsersModule } from '../users/users.module';
import { ChatMediaRepository } from 'src/repositories/chat-media.repository';
import { PaymentModule } from '../../payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageRepository,
      ConversationRepository,
      ChatMediaRepository,
    ]),
    UsersModule,
    PaymentModule,
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
