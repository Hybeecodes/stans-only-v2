import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../../repositories/user.repository';
import { PostsModule } from '../posts/posts.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { ReportsModule } from '../reports/reports.module';
import { BlockModule } from '../block/block.module';
import { BookmarksModule } from '../bookmarks/bookmarks.module';
import { PaymentModule } from '../../payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    PostsModule,
    SubscriptionModule,
    ReportsModule,
    BlockModule,
    BookmarksModule,
    PaymentModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
