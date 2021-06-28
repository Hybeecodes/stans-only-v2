import { Module } from '@nestjs/common';
import { SuggestionsController } from './suggestions.controller';
import { SuggestionsService } from './suggestions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../../repositories/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository])],
  controllers: [SuggestionsController],
  providers: [SuggestionsService],
})
export class SuggestionsModule {}
