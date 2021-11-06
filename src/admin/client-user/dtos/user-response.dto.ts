import { User } from '../../../entities/user.entity';

export class UserResponseDto implements Partial<User> {
  public id: number;
  public firstName: string;
  public lastName: string;
  public userName: string;
  public email: string;
  public phoneNumber: string;
  public isContentCreator: boolean;
  public subscribersCount: number;
  public subscriptionFee: number;
  public subscriptionType: string;
  public blockedCount: number;
  public uploadsCount: number;
  public bio: string;
  public location: string;
  public webLink: string;
  public dateOfBirth: Date;
  public emailNotificationStatus: boolean;
  public pushNotificationStatus: boolean;
  public isSocialAuthUser: boolean;
  public lastLogin: Date;

  constructor(user: User) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.userName = user.userName;
    this.email = user.email;
    this.phoneNumber = user.phoneNumber;
    this.subscribersCount = user.subscribersCount;
    this.blockedCount = user.blockedCount;
    this.uploadsCount = user.uploadsCount;
    this.subscriptionFee = user.subscriptionFee;
    this.subscriptionType = user.subscriptionType;
    this.isContentCreator = user.isContentCreator;
    this.bio = user.bio;
    this.location = user.location;
    this.webLink = user.webLink;
    this.dateOfBirth = user.dateOfBirth;
    this.emailNotificationStatus = user.emailNotificationStatus;
    this.pushNotificationStatus = user.pushNotificationStatus;
    this.isSocialAuthUser = user.isSocialAuthUser;
    this.lastLogin = user.lastLogin;
  }
}
