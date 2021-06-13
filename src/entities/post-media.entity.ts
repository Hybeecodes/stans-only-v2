import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('post_media')
export class PostMedia {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Post, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn()
  post: Post;

  @Column('varchar', { nullable: false })
  url: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
