import { BaseQueryDto } from '../../shared/dtos/base-query.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { PaymentType } from '../../entities/wallet-history.entity';

export class GetWalletHistoryQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsEnum(PaymentType, { message: 'Invalid transaction type' })
  transactionType: string;
}
