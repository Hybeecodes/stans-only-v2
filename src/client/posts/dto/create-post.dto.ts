import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreatePostDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  caption: string;

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @IsUrl({}, { each: true })
  media: string[];
}
