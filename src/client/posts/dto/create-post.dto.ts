import {
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { MediaTypes } from '../../enums/image-types.enum';

export class CreatePostDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  caption: string;

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @IsObject({ each: true })
  media: MediaObject[];
}

export class MediaObject {
  @IsDefined()
  @IsUrl()
  url: string;

  @IsDefined()
  @IsEnum(MediaTypes, { message: 'Invalid Media Type' })
  mediaType: string;
}
