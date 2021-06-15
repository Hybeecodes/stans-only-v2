import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class NewCommentDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  message: string;
}
