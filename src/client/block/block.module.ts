import { forwardRef, Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockRepository } from '../../repositories/block.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlockRepository]),
    forwardRef(() => UsersModule),
  ],
  providers: [BlockService],
  exports: [BlockService],
})
export class BlockModule {}
