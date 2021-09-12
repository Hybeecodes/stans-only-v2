import { BaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { Transaction, TransactionTypes } from './transaction.entity';

@Entity('wallet_history')
export class WalletHistory extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Transaction, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column('enum', { enum: TransactionTypes })
  type: TransactionTypes;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    default: '0.0',
  })
  amount: number;
}
