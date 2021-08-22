import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MediaTypes } from '../client/enums/image-types.enum';
import { Message } from './message.entity';

@Entity('chat_media')
export class ChatMedia {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Message, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn()
  message: Message;

  @Column('varchar', { nullable: false })
  url: string;

  @Column('enum', { nullable: true, enum: MediaTypes })
  mediaType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
