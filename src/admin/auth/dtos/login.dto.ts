import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class AdminLoginDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  password: string;
}
