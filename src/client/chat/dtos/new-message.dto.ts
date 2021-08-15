import { IsDefined, IsOptional } from 'class-validator';

export class NewMessageDto {
  @IsDefined()
  recipientId: number;

  @IsOptional()
  body: string;

  @IsOptional()
  media: string[];
}
