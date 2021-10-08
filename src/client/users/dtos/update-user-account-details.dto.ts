import { IsDefined, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateUserAccountDetailsDto {
  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  userName: string;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  // @IsPhoneNumber('NG', { message: 'Invalid Phone NUmber' })
  phoneNumber: string;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  subscriptionFee: number;
}
