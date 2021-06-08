import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UpdateUserAccountDetailsDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsPhoneNumber('NG', { message: 'Invalid Phone NUmber' })
  phoneNumber: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  subscriptionFee: number;
}
