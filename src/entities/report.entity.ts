import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

export enum ReportedType {
  POST = 'POST',
  USER = 'USER',
}

@Entity()
export class Report extends BaseEntity {
  @ManyToOne(() => User)
  reporter: User;

  @Column('varchar', { nullable: false })
  reason: string;

  @Column('int', { nullable: false })
  reportedId: number;

  @Column('enum', { nullable: false, enum: ReportedType })
  reportedType: string;
}
