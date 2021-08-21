import { IsDefined, IsEnum, IsOptional, IsNotEmpty, IsArray, IsObject } from 'class-validator';
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
}
