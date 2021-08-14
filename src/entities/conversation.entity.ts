import { BaseEntity } from './base.entity';
import { Column, ManyToMany, OneToMany, JoinTable, Entity } from 'typeorm';
import { Message } from './message.entity';
import { User } from './user.entity';

export enum ConversationType {
  ONE_TO_ONE = 'ONE_TO_ONE',
}

@Entity()
export class Conversation extends BaseEntity {
  @Column('varchar', { unique: true })
  conversationId: string;

  @Column('enum', {
    enum: ConversationType,
    default: ConversationType.ONE_TO_ONE,
  })
  conversationType: string;

  @ManyToMany(() => User)
  @JoinTable()
  participants: User[];

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @Column('datetime')
  lastMessageDate: Date;
}
