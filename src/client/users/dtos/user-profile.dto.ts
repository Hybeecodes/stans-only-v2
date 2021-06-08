import { User } from '../../../entities/user.entity';

export class UserProfileDto implements Partial<User> {
  public firstName: string;
  public lastName: string;
  public userName: string;
  public email: string;
  public phoneNumber: string;
  public coverPictureUrl: string;
  public profilePictureUrl: string;
  public isContentCreator: boolean;
  public bio: string;
  public location: string;
  public webLink: string;
  public dateOfBirth: Date;
  public emailNotificationStatus: boolean;
  public pushNotificationStatus: boolean;

  constructor(user: User) {
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.userName = user.userName;
    this.phoneNumber = user.phoneNumber;
    this.coverPictureUrl = user.coverPictureUrl;
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
