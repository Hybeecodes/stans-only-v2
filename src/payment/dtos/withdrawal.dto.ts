import { IsDefined, IsNotEmpty, IsNumber } from 'class-validator';

export class WithdrawalDto {
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
