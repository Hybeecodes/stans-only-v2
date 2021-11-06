import { BaseQueryDto } from '../../../shared/dtos/base-query.dto';
import { IsBooleanString, IsOptional } from 'class-validator';

export class GetAllUsersQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsBooleanString({ message: 'isContentCreator should be boolean' })
  isContentCreator: boolean;
}
