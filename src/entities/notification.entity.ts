import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum NotificationStatus {
  READ = 'READ',
  UNREAD = 'UNREAD',
}

export enum NotificationType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  BOOKMARK = 'BOOKMARK',
  COMMENT = 'COMMENT',
  LIKE = 'LIKE',
  TIP = 'TIP',
}

@Entity()
export class Notification extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn()
  recipient: User;

  @ManyToOne(() => User)
  @JoinColumn()
  sender: User;

  @Column('text', { nullable: true, default: null })
  meta: string;

  @Column('varchar', { nullable: false })
  message: string;

  @Column('enum', {
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
  })
  status: string;

  @Column('enum', {
    enum: NotificationType,
    nullable: false,
  })
  type: string;

  @Column('datetime', { default: null })
  readDate: Date;
}
