import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

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
