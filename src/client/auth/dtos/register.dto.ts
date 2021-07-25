import {
  IsAlpha,
  IsAlphanumeric,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
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
  @Matches(/[^a-z0-9]/gi, { message: 'Username must be Alphanumeric' })
  @MaxLength(30)
  @MinLength(3)
  userName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  @MinLength(6)
  password: string;

  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
