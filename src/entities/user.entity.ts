import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusType } from '../shared/constants/status-type.enum';
import { comparePassword, hashPassword } from '../utils/helpers';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar', { nullable: false, length: 255 })
  firstName: string;

  @Column('varchar', { nullable: false, length: 255 })
  lastName: string;

  @Column('varchar', { nullable: false, length: 30, unique: true })
  userName: string;

  @Column('varchar', { nullable: false, length: 255, unique: true })
  email: string;

  @Exclude()
  @Column('varchar', { nullable: false, length: 255 })
  password: string;

  @Column('varchar', { nullable: true, length: 255 })
  phoneNumber: string;

  @Column('varchar', { nullable: true, length: 255 })
  coverPictureUrl: string;

  @Column('varchar', { nullable: true, length: 255 })
  profilePictureUrl: string;

  @Column('boolean', { nullable: false, default: false })
  isContentCreator: boolean;

  @Column('text', { nullable: true })
  bio: string;

  @Column('varchar', { nullable: true, length: 255 })
  location: string;

  @Column('varchar', { nullable: true, length: 255 })
  webLink: string;

  @Column('varchar', { nullable: true, length: 255 })
  resetToken: string;

  @Column('date', { nullable: true })
  dateOfBirth: Date;

  @Column('boolean', { nullable: false, default: false })
  isConfirmed: boolean;

  @Column('boolean', { nullable: false, default: false })
  emailNotificationStatus: boolean;

  @Column('boolean', { nullable: false, default: false })
  pushNotificationStatus: boolean;

  @Column('decimal', { nullable: false, default: '0.0', precision: 2 })
  subscriptionFee: number;

  @Column('enum', {
    nullable: false,
    default: StatusType.INACTIVE,
    enum: StatusType,
  })
  status: string;

  @Column('boolean', { nullable: false, default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  hashPassword() {
    this.password = hashPassword(this.password);
  }

  isPasswordValid(password: string): boolean {
    return comparePassword(password, this.password);
  }

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  toUserResponse(): UserDto {
    const {
      id,
      firstName,
      lastName,
      userName,
      email,
      phoneNumber,
      coverPictureUrl,
      profilePictureUrl,
      isContentCreator,
    } = this;
    return {
      id,
      firstName,
      lastName,
      userName,
      email,
      phoneNumber,
      coverPictureUrl,
      profilePictureUrl,
      isContentCreator,
    };
  }
}

export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  coverPictureUrl: string;
  profilePictureUrl: string;
  isContentCreator: boolean;
}
