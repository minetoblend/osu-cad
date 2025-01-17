import type { IVec2 } from '@osucad/framework';

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
  cursor: CursorPosition | null;
}

export interface UserClockInfo {
  currentTime: number;
  isRunning: boolean;
  rate: number;
}

export interface CursorPosition {
  screen: string;
  position: IVec2;
  pressed: boolean;
}
