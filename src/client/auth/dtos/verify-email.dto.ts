import { IsDefined, IsJWT, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @IsDefined()
  @IsNotEmpty()
  @IsJWT()
  token: string;
}
