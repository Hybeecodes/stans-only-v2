import { EntityRepository, Repository } from 'typeorm';
import { Block } from '../entities/block.entity';

@EntityRepository(Block)
export class BlockRepository extends Repository<Block> {}
