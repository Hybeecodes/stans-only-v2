import { Injectable, Logger } from '@nestjs/common';
import { PostsService } from '../../../../client/posts/posts.service';

@Injectable()
export class PostEventHandlerService {
  private readonly logger: Logger;

  constructor(private readonly postsService: PostsService) {
    this.logger = new Logger(PostEventHandlerService.name);
  }
}
