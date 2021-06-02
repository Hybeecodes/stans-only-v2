import { IsDefined, IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
