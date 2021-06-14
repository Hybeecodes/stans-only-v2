import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateImageUploadSignatureDto } from '../shared/services/storage/dto/create-image-upload-signature.dto';
import { UploadSignatureResponseDto } from '../shared/services/storage/dto/upload-signature-response.dto';
import { FileService } from './file.service';
import { UserAuthGuard } from '../utils/guards/user-auth.guard';

@UseGuards(UserAuthGuard)
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('upload-signature')
  createUploadSignature(
    @Body() createUploadSignature: CreateImageUploadSignatureDto,
  ): UploadSignatureResponseDto {
    return this.fileService.generateSignature(createUploadSignature);
  }
}
