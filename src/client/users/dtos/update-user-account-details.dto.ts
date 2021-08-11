import { IsDefined, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateUserAccountDetailsDto {
  @IsDefined()
  @IsNotEmpty()
  userName: string;

  @IsDefined()
  @IsNotEmpty()
  // @IsPhoneNumber('NG', { message: 'Invalid Phone NUmber' })
  phoneNumber: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  subscriptionFee: number;
}
