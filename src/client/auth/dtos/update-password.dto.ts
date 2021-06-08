import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
