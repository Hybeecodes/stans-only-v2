import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreatePostDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  caption: string;

  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @IsUrl({}, { each: true })
  media: string[];
}
