import {
  IsAlpha,
  IsAlphanumeric,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  firstName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  lastName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  @MaxLength(30)
  @MinLength(3)
  userName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  @MaxLength(8)
  @MinLength(8)
  password: string;

  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
