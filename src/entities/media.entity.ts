import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MediaTypes } from '../client/enums/image-types.enum';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('enum', { nullable: false, enum: MediaTypes })
  type: string;

  @Column('varchar', { nullable: false })
  url: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
