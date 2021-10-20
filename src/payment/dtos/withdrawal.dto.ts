import { IsDefined, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class WithdrawalDto {
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  @Min(100, { message: "Sorry, you can't withdraw less than N100" })
  amount: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  accountId: number;
}
