export interface UserInfo {
  username: string;
  avatarUrl: string;
  userId: number;
}

export interface ClientInfo extends UserInfo {
  clientId: number;
  presence: any;
}
