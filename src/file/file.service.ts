import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { StorageService } from '../shared/services/storage/interfaces/storage-service.interface';
import { Injectables } from '../shared/constants/injectables.enum';
import { CreateImageUploadSignatureDto } from '../shared/services/storage/dto/create-image-upload-signature.dto';
import { UploadSignatureResponseDto } from '../shared/services/storage/dto/upload-signature-response.dto';

@Injectable()
export class FileService {
  private readonly logger: Logger;
  constructor(
    @Inject(Injectables.STORAGE_SERVICE)
    private readonly storageService: StorageService,
  ) {
    this.logger = new Logger(FileService.name);
  }

  generateSignature(
    data: CreateImageUploadSignatureDto,
  ): UploadSignatureResponseDto {
    try {
      return this.storageService.generateUploadSignature(data);
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
}
