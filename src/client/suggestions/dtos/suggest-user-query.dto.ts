import { BaseQueryDto } from '../../../shared/dtos/base-query.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { SubscriptionType } from '../../../entities/user.entity';

export class SuggestUserQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsEnum(SubscriptionType, {
    message: 'Subscription Type must be one of ["Free", "PAID"]',
  })
  subscriptionType: string;
}
