import { IsDefined, IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationDto {
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
