import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';

export class SocialLoginDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  profilePicUrl: string;

  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
