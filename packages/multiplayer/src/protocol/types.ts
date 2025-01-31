import type { IVec2 } from '@osucad/framework';

export interface UserInfo {
  username: string;
  userId: number;
}

export interface ClientInfo {
  clientId: number;
  user: UserInfo;
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

export interface SummaryWithOps {
  summary: SummaryMessage;
  ops: SequencedOpsMessage[];
}

export interface SummaryMessage {
  clientId: number;
  sequenceNumber: string;
  summary: string;
  assets: AssetInfo[];
}

export interface SequencedOpsMessage {
  clientId: number;
  sequenceNumber: string;
  version: number;
  ops: string[];
}

export interface AssetInfo {
  path: string;
  id: string;
}
