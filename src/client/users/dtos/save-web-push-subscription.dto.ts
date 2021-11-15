import { IsDefined, IsNotEmpty, IsObject } from 'class-validator';

export class SaveWebPushSubscriptionDto {
  @IsDefined()
  @IsNotEmpty()
  endpoint: string;

  @IsDefined()
  @IsObject()
  keys: {
    p256dh: string;
    auth: string;
  };
}
