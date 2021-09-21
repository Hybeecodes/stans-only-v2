import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class CompleteTopUpTransactionDto {
  @IsDefined()
  @IsNotEmpty()
  transactionId: string; // this is flutterwave reference

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  reference: string; // this is stans-only local reference
}
