import { IsDefined, IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsDefined()
  @IsNotEmpty()
  @IsJWT()
  hash: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  password: string;
}
