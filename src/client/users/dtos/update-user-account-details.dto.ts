import { IsDefined, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateUserAccountDetailsDto {
  @IsDefined()
  userName: string;

  @IsDefined()
  // @IsPhoneNumber('NG', { message: 'Invalid Phone NUmber' })
  phoneNumber: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  subscriptionFee: number;
}
