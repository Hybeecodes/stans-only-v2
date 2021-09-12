import { EntityRepository, Repository } from 'typeorm';
import { WalletLedger } from '../entities/wallet-ledger.entity';

@EntityRepository(WalletLedger)
export class WalletLedgerRepository extends Repository<WalletLedger> {}
