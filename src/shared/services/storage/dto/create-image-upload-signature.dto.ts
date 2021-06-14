import { IsAscii } from 'class-validator';

export class CreateImageUploadSignatureDto {
  @IsAscii()
  publicId: string;
}
