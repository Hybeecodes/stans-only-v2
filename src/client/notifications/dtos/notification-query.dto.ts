import { BaseQueryDto } from '../../../shared/dtos/base-query.dto';
import { IsBooleanString, IsEnum, IsOptional } from 'class-validator';
import { NotificationStatus } from '../../../entities/notification.entity';

export class NotificationQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsEnum(NotificationStatus, { message: 'status can only be READ or UNREAD' })
  status: string;

  @IsOptional()
  @IsBooleanString()
  subscription: string;

  @IsOptional()
  @IsBooleanString()
  bookmark: string;

  @IsOptional()
  @IsBooleanString()
  comment: string;

  @IsOptional()
  @IsBooleanString()
  like: string;
}
