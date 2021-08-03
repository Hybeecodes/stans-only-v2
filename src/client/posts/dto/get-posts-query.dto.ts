import { IsBooleanString, IsOptional } from 'class-validator';
import { BaseQueryDto } from '../../../shared/dtos/base-query.dto';

export class GetPostsQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsBooleanString()
  hasText: boolean;

  @IsOptional()
  @IsBooleanString()
  hasImage: boolean;

  @IsOptional()
  @IsBooleanString()
  hasVideo: boolean;
}
