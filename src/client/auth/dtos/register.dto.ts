import {
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
  firstName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @MinLength(3)
  userName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  password: string;

  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
