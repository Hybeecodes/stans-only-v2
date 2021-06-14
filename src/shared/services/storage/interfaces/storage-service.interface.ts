import { CreateImageUploadSignatureDto } from '../dto/create-image-upload-signature.dto';
import { UploadSignatureResponseDto } from '../dto/upload-signature-response.dto';

export interface StorageService {
  generateUploadSignature: (
    createUploadSignature: CreateImageUploadSignatureDto,
  ) => UploadSignatureResponseDto;

  deleteFileWithPublicId: (publicId: string) => Promise<void>;
}
