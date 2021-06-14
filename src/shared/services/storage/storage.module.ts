import { Module } from '@nestjs/common';
import { Injectables } from 'src/shared/constants/injectables.enum';

import { CloudinaryService } from './cloudinary/cloudinary.service';

@Module({
  imports: [],
  providers: [
    {
      provide: Injectables.STORAGE_SERVICE,
      useClass: CloudinaryService,
    },
  ],
  exports: [Injectables.STORAGE_SERVICE],
})
export class StorageModule {}
