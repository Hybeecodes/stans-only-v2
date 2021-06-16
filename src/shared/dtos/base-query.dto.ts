import { IsNumberString, IsOptional } from 'class-validator';

export class BaseQueryDto {
  @IsOptional()
  @IsNumberString()
  limit: number;

  @IsOptional()
  @IsNumberString()
  offset: number;
}
