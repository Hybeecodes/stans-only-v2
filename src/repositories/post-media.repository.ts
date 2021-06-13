import { EntityRepository, Repository } from 'typeorm';
import { PostMedia } from '../entities/post-media.entity';

@EntityRepository(PostMedia)
export class PostMediaRepository extends Repository<PostMedia> {}
