import { IsDefined, IsNotEmpty, IsNumber } from 'class-validator';

export class TipDto {
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
