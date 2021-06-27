import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { BaseQueryDto } from '../../../shared/dtos/base-query.dto';

export class SearchQueryDto extends BaseQueryDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  query: string;
}
