import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator';

export enum Countries {
  NG = 'NG',
}
export class FetchBanksQueryDto {
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(Countries, { message: 'Invalid Country' })
  country: string;
}
