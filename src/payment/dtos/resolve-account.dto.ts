import { IsDefined, IsNotEmpty } from 'class-validator';

export class ResolveAccountDto {
  @IsDefined()
  @IsNotEmpty()
  accountNumber: string;

  @IsDefined()
  @IsNotEmpty()
  bankCode: string;
}
