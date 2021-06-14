import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';

import { UploadSignatureResponseDto } from '../dto/upload-signature-response.dto';
import { StorageService } from '../interfaces/storage-service.interface';
import { ConfigService } from '@nestjs/config';
import { CreateImageUploadSignatureDto } from '../dto/create-image-upload-signature.dto';

@Injectable()
export class CloudinaryService implements StorageService {
  private logger: Logger;

  constructor(private readonly config: ConfigService) {
    this.logger = new Logger('CloudinaryService', true);
  }

  generateUploadSignature(
    createUploadSignature: CreateImageUploadSignatureDto,
  ): UploadSignatureResponseDto {
    try {
      this.logger.log('Generating Upload Signature');
      const timestamp = Math.round(Date.now() / 1000);
      const signature = Cloudinary.utils.api_sign_request(
        {
          timestamp,
          public_id: createUploadSignature.publicId,
        },
        this.config.get<string>('CLOUDINARY_API_SECRET'),
      );
      const response = new UploadSignatureResponseDto();
      response.publicId = createUploadSignature.publicId;
      response.signature = signature;
      response.timestamp = timestamp;
      return response;
    } catch (error) {
      this.logger.error(
        `Signature Not Created: ${JSON.stringify(error.message)}`,
      );
      throw new HttpException(
        'Signature Not Created',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFileWithPublicId(publicId: string): Promise<void> {
    try {
      await Cloudinary.uploader.destroy(publicId);
    } catch (error) {
      this.logger.error(`File Not Deleted: ${JSON.stringify(error.message)}`);
      throw new HttpException(
        'File Not Deleted',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
