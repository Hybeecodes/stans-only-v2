import { BaseEntity } from './base.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';
import { Exclude } from 'class-transformer';
import { comparePassword, hashPassword } from 'src/utils/helpers';
import { StatusType } from '../shared/constants/status-type.enum';

@Entity('admin_users')
export class AdminUser extends BaseEntity {
  @Column('varchar', { nullable: false, length: 255 })
  firstName: string;

  @Column('varchar', { nullable: false, length: 255 })
  lastName: string;

  @Column('varchar', { nullable: false, length: 30, unique: true })
  userName: string;

  @Column('varchar', { nullable: false, length: 255, unique: true })
  email: string;

  @Exclude()
  @Column('varchar', { nullable: true, length: 255 })
  password?: string;

  @Column('varchar', { nullable: true, length: 255 })
  resetToken: string;

  @Column('boolean', { nullable: false, default: false })
  isConfirmed: boolean;

  @Column('enum', {
    nullable: false,
    default: StatusType.INACTIVE,
    enum: StatusType,
  })
  status: string;

  @BeforeInsert()
  hashPassword() {
    if (this.password) this.password = hashPassword(this.password);
  }

  isPasswordValid(password: string): boolean {
    return comparePassword(password, this.password);
  }

  toUserResponse(): AdminUserDto {
    const { id, firstName, lastName, userName, email } = this;
    return {
      id,
      firstName,
      lastName,
      userName,
      email,
    };
  }
}

export interface AdminUserDto {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
}

export type AdminUserLoginResponse = AdminUserDto;
