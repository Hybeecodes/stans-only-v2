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
import { MediaTypes } from '../client/enums/image-types.enum';

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

  @Column('enum', { nullable: true, enum: MediaTypes })
  mediaType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
