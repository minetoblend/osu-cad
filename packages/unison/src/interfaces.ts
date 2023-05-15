export interface IClient {
  clientId: number;
  user: IUser;

  data: Record<string, any>;
}

export interface IUser extends Record<string, unknown> {
  id: string;
  name: string;
}
