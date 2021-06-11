import { IsString } from 'class-validator';

export class UpdateUserProfileDto {
  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  public email: string;

  public coverPictureUrl: string;

  public profilePictureUrl: string;

  public bio: string;

  public location: string;

  public webLink: string;

  public dateOfBirth: Date;
}
