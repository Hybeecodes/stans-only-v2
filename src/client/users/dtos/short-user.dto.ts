export class ShortUserDto {
  public id: number;
  public firstName: string;
  public lastName: string;
  public userName: string;
  public profilePictureUrl: string;

  constructor(user: any) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.userName = user.userName;
    this.profilePictureUrl = user.profilePictureUrl;
  }
}
