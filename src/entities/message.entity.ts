import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Conversation } from './conversation.entity';
import { ChatMedia } from './chat-media.entity';

@Entity()
export class Message extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn()
  sender: User;

  @ManyToOne(() => User)
  @JoinColumn()
  receiver: User;

  @Column('varchar', { length: 200, nullable: true })
  body: string;

  @Column('boolean', { default: false })
  isRead: boolean;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn()
  conversation: Conversation;

  @OneToMany(() => ChatMedia, (chatMedia) => chatMedia.message, { eager: true })
  media: ChatMedia[];
}
