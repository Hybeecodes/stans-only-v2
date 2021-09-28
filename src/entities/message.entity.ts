import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Conversation } from './conversation.entity';
import { ChatMedia } from './chat-media.entity';

@Entity()
export class Message extends BaseEntity {
  // add column explicitly here
  @Column({ name: 'sender_id' })
  senderId: number;

  // add column explicitly here
  @Column({ name: 'receiver_id' })
  receiverId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column('varchar', { length: 200, nullable: true })
  body: string;

  @Column('boolean', { default: false })
  isPaid: boolean;

  @Column('boolean', { default: true })
  canView: boolean;

  @Column('decimal', { default: '0.0', precision: 12, scale: 2 })
  cost: number;

  @Column('boolean', { default: false })
  isRead: boolean;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn()
  conversation: Conversation;

  @OneToMany(() => ChatMedia, (chatMedia) => chatMedia.message, { eager: true })
  media: ChatMedia[];
}
