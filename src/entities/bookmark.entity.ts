import { BaseEntity } from './base.entity';
import { Post } from './post.entity';
import { User } from './user.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Bookmark extends BaseEntity {
  @ManyToOne(() => Post)
  @JoinColumn()
  post: Post;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;
}
