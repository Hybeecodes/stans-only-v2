import { IsBooleanString, IsNumberString, IsOptional } from 'class-validator';

export class BaseQueryDto {
  @IsOptional()
  @IsNumberString()
  limit: number;

  @IsOptional()
  @IsNumberString()
  offset: number;

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
