import { BaseQueryDto } from '../../../shared/dtos/base-query.dto';
import { IsEnum, IsOptional } from 'class-validator';
import {
  NotificationStatus,
  NotificationType,
} from '../../../entities/notification.entity';

export class NotificationQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsEnum(NotificationStatus, { message: 'status can only be READ or UNREAD' })
  status: string;

  @IsOptional()
  @IsEnum(NotificationType, { message: 'Invalid notification type' })
  type: string;
}
