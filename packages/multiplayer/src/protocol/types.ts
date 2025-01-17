export interface UserInfo {
  username: string;
  avatarUrl: string;
  userId: number;
}

export interface ClientInfo extends UserInfo {
  clientId: number;
  presence: any;
  color: number;
}

export interface UserPresence {
  clock: UserClockInfo;
}

export interface UserClockInfo {
  currentTime: number;
  isRunning: boolean;
  rate: number;
}
