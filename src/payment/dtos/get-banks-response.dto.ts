export class GetBanksResponseDto {
  public status: boolean;
  public message: string;
  public data: [
    {
      id: number;
      code: string;
      name: string;
    },
  ];
  constructor(data) {
    this.status = data.status;
    this.message = data.message;
    this.data = data.data;
  }
}
