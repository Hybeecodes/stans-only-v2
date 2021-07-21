import { User } from '../../../entities/user.entity';

export class UserProfileDto implements Partial<User> {
  public id: number;
  public firstName: string;
  public lastName: string;
  public userName: string;
  public email: string;
  public phoneNumber: string;
  public coverPictureUrl: string;
  public profilePictureUrl: string;
  public isContentCreator: boolean;
  public subscribersCount: number;
  public blockedCount: number;
  public bio: string;
  public location: string;
  public webLink: string;
  public dateOfBirth: Date;
  public emailNotificationStatus: boolean;
  public pushNotificationStatus: boolean;
  public isSubscribedToUser: boolean;

  constructor(user: User) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.userName = user.userName;
    this.email = user.email;
    this.phoneNumber = user.phoneNumber;
    this.coverPictureUrl = user.coverPictureUrl;
    this.subscribersCount = user.subscribersCount;
    this.blockedCount = user.blockedCount;
    this.profilePictureUrl = user.profilePictureUrl;
    this.isContentCreator = user.isContentCreator;
    this.bio = user.bio;
    this.location = user.location;
    this.webLink = user.webLink;
    this.dateOfBirth = user.dateOfBirth;
    this.emailNotificationStatus = user.emailNotificationStatus;
    this.pushNotificationStatus = user.pushNotificationStatus;
  }
}
