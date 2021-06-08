import {
  IsDefined,
  IsEmail,
  IsISO8601,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateUserProfileDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  public firstName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  public lastName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsDefined()
  @IsNotEmpty()
  @IsUrl()
  public coverPictureUrl: string;

  @IsDefined()
  @IsNotEmpty()
  @IsUrl()
  public profilePictureUrl: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  public bio: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  public location: string;

  @IsDefined()
  @IsNotEmpty()
  @IsUrl()
  public webLink: string;

  @IsDefined()
  @IsNotEmpty()
  @IsISO8601()
  public dateOfBirth: Date;
}
