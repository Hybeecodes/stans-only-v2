import { forwardRef, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostRepository } from '../../repositories/post.repository';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostMediaRepository } from '../../repositories/post-media.repository';
import { CommentRepository } from '../../repositories/comment.repository';
import { LikeRepository } from '../../repositories/like.repository';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    SubscriptionModule,
    TypeOrmModule.forFeature([
      PostRepository,
      PostMediaRepository,
      CommentRepository,
      LikeRepository,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        // "jsonwebtoken" option to sign
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
