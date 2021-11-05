import { BaseEntity } from './base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export enum LedgerStatus {
  ON_HOLD_FOR_SUBSCRIPTION = 'ON_HOLD_FOR_SUBSCRIPTION',
  RELEASED = 'RELEASED',
  ON_HOLD_FOR_WITHDRAWAL = 'ON_HOLD_FOR_WITHDRAWAL', // money is help for withdrawal operation
}

@Entity('wallet_ledger')
export class WalletLedger extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    default: '0.0',
  })
  amount: number;

  @Column('varchar', { length: 255, nullable: true })
  transactionReference: string;

  @Index('idx_ledger_status')
  @Column('enum', {
    enum: LedgerStatus,
    default: LedgerStatus.ON_HOLD_FOR_SUBSCRIPTION,
  })
  ledgerStatus: LedgerStatus;
}
