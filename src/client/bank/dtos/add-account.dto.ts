import { IsDefined, IsNotEmpty } from 'class-validator';

export class AddAccountDto {
  @IsDefined()
  @IsNotEmpty()
  bankCode: string;

  @IsDefined()
  @IsNotEmpty()
  bankName: string;

  @IsDefined()
  @IsNotEmpty()
  accountName: string;

  @IsDefined()
  @IsNotEmpty()
  accountNumber: string;
}
