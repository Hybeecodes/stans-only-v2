import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class NewReportDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  reason: string;
}
