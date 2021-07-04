import { forwardRef, Module } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarkRepository } from '../../repositories/bookmark.repository';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookmarkRepository]),
    forwardRef(() => PostsModule),
    forwardRef(() => UsersModule),
  ],
  providers: [BookmarksService],
  exports: [BookmarksService],
})
export class BookmarksModule {}
