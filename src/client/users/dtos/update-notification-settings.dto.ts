import { IsBoolean, IsDefined, IsNotEmpty } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @IsDefined()
  @IsNotEmpty()
  @IsBoolean()
  enableEmailNotification: boolean;

  @IsDefined()
  @IsNotEmpty()
  @IsBoolean()
  enablePushNotification: boolean;
}
