import { BaseQueryDto } from '../../../shared/dtos/base-query.dto';
import { IsBooleanString, IsEnum, IsOptional } from 'class-validator';
import { NotificationStatus } from '../../../entities/notification.entity';

export class NotificationQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsEnum(NotificationStatus, { message: 'status can only be READ or UNREAD' })
  status: string;

  @IsOptional()
  @IsBooleanString()
  subscription: boolean;

  @IsOptional()
  @IsBooleanString()
  bookmark: boolean;

  @IsOptional()
  @IsBooleanString()
  comment: boolean;

  @IsOptional()
  @IsBooleanString()
  like: boolean;
}
