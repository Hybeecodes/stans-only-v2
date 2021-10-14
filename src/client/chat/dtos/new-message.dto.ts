import {
  IsDefined,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsObject,
  IsBoolean,
  ValidateIf,
  IsNumber,
  Min,
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
  @Min(0, { message: 'You can not set a negative cost' })
  cost: number;
}
