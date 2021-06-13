import { EntityRepository, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { PostMedia } from '../entities/post-media.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Media } from '../entities/media.entity';
import { User } from '../entities/user.entity';

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {
  constructor(
    @InjectRepository(PostMedia)
    private readonly postMediaRepository: Repository<PostMedia>,
  ) {
    super();
  }

  async createPost(post: Partial<Post>): Promise<Post> {
    const newPost = this.create(post);
    return await this.save(newPost);
  }

  async findPostById(postId: number): Promise<Post> {
    return this.findOne({
      where: { id: postId, isDeleted: false },
      relations: ['author'],
    });
  }

  async findPostsByAuthor(author: User): Promise<Post[]> {
    return this.find({
      where: { author },
      relations: ['comments', 'likes', 'author', 'media'],
    });
  }

  async findPostDetailsById(postId: number): Promise<Post> {
    return this.findOne({
      where: { id: postId, isDeleted: false },
      relations: ['comments', 'likes', 'author', 'media'],
    });
  }

  async createPostMedia(post: Post, media: Media): Promise<void> {
    console.log(post);
    console.log(media);
    await this.postMediaRepository.query(
      `INSERT INTO post_media (post_id, media_id) VALUES (${post.id}, ${media.id})`,
    );
  }
}
