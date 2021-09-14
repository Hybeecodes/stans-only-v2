import { BaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class BankAccount extends BaseEntity {
  @Column({
    type: 'varchar',
  })
  bankCode: string;

  @Column({
    type: 'varchar',
  })
  bankName: string;

  @Column({
    type: 'varchar',
  })
  accountName: string;

  @Column({
    type: 'varchar',
  })
  accountNumber: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    default: false,
  })
  isDefault: boolean;
}
