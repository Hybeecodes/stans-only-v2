import { IsDefined, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class TipDto {
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'You can not set a negative amount' })
  amount: number;
}
