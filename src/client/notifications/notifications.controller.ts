import { Controller, Get, Post, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { LoggedInUser } from '../../utils/decorators/logged-in-user.decorator';
import { NotificationQueryDto } from './dtos/notification-query.dto';
import { SuccessResponseDto } from '../../shared/success-response.dto';

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
}
