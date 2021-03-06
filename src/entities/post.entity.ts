import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { PostMedia } from './post-media.entity';
import { Like } from './like.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar', { default: null, nullable: true, length: 200 })
  caption: string;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: false,
  })
  @JoinColumn()
  author: User;

  @Column('int', { default: null, nullable: false })
  commentsCount: number;

  @ManyToOne(() => Post, (parent) => parent.comments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent: Post;

  @OneToMany(() => Post, (comment) => comment.parent)
  comments: Post[];

  @Column('int', { default: null, nullable: false })
  likesCount: number;

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @OneToMany(() => PostMedia, (postMedia) => postMedia.post, { eager: true })
  media: PostMedia[];

  @Column('boolean', { nullable: false, default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
