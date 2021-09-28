import {
  IsDefined,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsObject,
  IsBoolean,
  ValidateIf,
  IsNumber,
} from 'class-validator';
import { MediaObject } from 'src/client/posts/dto/create-post.dto';

export class NewMessageDto {
  @IsDefined()
  recipientId: number;

  @IsOptional()
  body: string;

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @IsObject({ each: true })
  media: MediaObject[];

  @IsOptional()
  @IsBoolean()
  isPaid = true;

  @ValidateIf((o) => o.isPaid === true)
  @IsDefined()
  @IsNumber()
  cost: number;
}
