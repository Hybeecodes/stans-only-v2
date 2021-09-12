export class ResolveAccountResponseDto {
  public accountNumber: string;
  public accountName: string;
  public status: string;
  public message: string;

  constructor(data) {
    this.status = data.status;
    this.message = data.message;
    this.accountNumber = data.account_number;
    this.accountName = data.account_name;
  }
}
