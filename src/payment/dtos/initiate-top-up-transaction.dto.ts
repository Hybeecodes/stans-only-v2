import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class InitiateTopUpTransactionDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  reference; // this is stans-only local reference
}
