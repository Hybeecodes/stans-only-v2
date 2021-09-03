import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { LoggedInUser } from '../../utils/decorators/logged-in-user.decorator';
import { SuccessResponseDto } from '../../shared/success-response.dto';
import { NewMessageDto } from './dtos/new-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('unread/count')
  async getUserUnreadMessagesCount(
    @LoggedInUser('id') userId: number,
  ): Promise<SuccessResponseDto> {
    const response = await this.chatService.getUserUnreadMessageCount(userId);
    return new SuccessResponseDto('Successful', response);
  }

  @Get('conversations')
  async getUserConversations(
    @Query() queryData: BaseQueryDto,
    @LoggedInUser('id') userId: number,
  ): Promise<SuccessResponseDto> {
    const response = await this.chatService.getUserConversations(
      userId,
      queryData,
    );
    return new SuccessResponseDto('Successful', response);
  }

  @Get('conversations/:conversationId/messages')
  async getConversationMessages(
    @Query() queryData: BaseQueryDto,
    @Param('conversationId') conversationId: number,
  ): Promise<SuccessResponseDto> {
    const response = await this.chatService.getMesssagesByConversationId(
      conversationId,
      queryData,
    );
    return new SuccessResponseDto('Successful', response);
  }

  @Post('conversations/:conversationId/messages/read')
  async readConversationMessages(
    @Query() queryData: BaseQueryDto,
    @Param('conversationId') conversationId: number,
  ): Promise<SuccessResponseDto> {
    const response = await this.chatService.readConversationMessages(
      conversationId,
    );
    return new SuccessResponseDto('Successful', response);
  }

  @Post('messages')
  async newConversationMessages(
    @Body() body: NewMessageDto,
    @LoggedInUser('id') userId: number,
  ): Promise<SuccessResponseDto> {
    const response = await this.chatService.newMessage(body, userId);
    return new SuccessResponseDto('Message Sent Successfully', response);
  }

  @Get(':userName/messages')
  async getConversationWithUser(
    @Query() query: BaseQueryDto,
    @LoggedInUser('id') userId: number,
    @Param('userName') userName: string,
  ): Promise<SuccessResponseDto> {
    const response = await this.chatService.getConversationWithUser(
      userId,
      userName,
      query,
    );
    return new SuccessResponseDto('Message Retrieved Successfully', response);
  }

  @Delete('conversations/:conversationId/messages/:messageId')
  async deleteConversationMessages(
    @Param('messageId') messageId: number,
  ): Promise<SuccessResponseDto> {
    const response = await this.chatService.deleteMessage(messageId);
    return new SuccessResponseDto('Message Deleted Successfully', response);
  }
}
