import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { LoggedInUser } from '../../utils/decorators/logged-in-user.decorator';
import { NotificationQueryDto } from './dtos/notification-query.dto';
import { SuccessResponseDto } from '../../shared/success-response.dto';
import { SaveWebPushSubscriptionDto } from '../users/dtos/save-web-push-subscription.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('')
  async getAllUserNotifications(
    @LoggedInUser('id') id: number,
    @Query() queryInput: NotificationQueryDto,
  ): Promise<SuccessResponseDto> {
    const response = await this.notificationsService.getAllUserNotifications(
      id,
      queryInput,
    );
    return new SuccessResponseDto('Successful', response);
  }

  @Put('save-subscription')
  async saveWebPushSubscription(
    @LoggedInUser('id') userId: number,
    @Body() subscription: SaveWebPushSubscriptionDto,
  ) {
    const response = await this.notificationsService.updateWebPushSubscription(
      userId,
      subscription,
    );
    return new SuccessResponseDto(
      'Subscription updated successfully',
      response,
    );
  }

  @Get('count')
  async getUserUnreadNotificationCount(
    @LoggedInUser('id') id: number,
  ): Promise<SuccessResponseDto> {
    const response =
      await this.notificationsService.getUserUnreadNotificationCount(id);
    return new SuccessResponseDto('Successful', response);
  }

  @Post('read')
  async readAllUserNotifications(
    @LoggedInUser('id') id: number,
  ): Promise<SuccessResponseDto> {
    const response = await this.notificationsService.readAllUserNotifications(
      id,
    );
    return new SuccessResponseDto(
      'Notifications Marked Read Successfully',
      response,
    );
  }

  @Post(':id/read')
  async readOneUserNotifications(
    @Param('id') id: number,
  ): Promise<SuccessResponseDto> {
    const response = await this.notificationsService.readUserNotifications(id);
    return new SuccessResponseDto(
      'Notification Marked Read Successfully',
      response,
    );
  }
}
