import { Presence } from './presence';
import { UserInfo } from '../types';
import { BeatmapAccess } from './beatmap';

export type UserId = number;

export interface UserSessionInfo extends UserInfo {
  sessionId: number;
  access: BeatmapAccess;
  presence: Presence;
  color: string;
}

export type UserRole = 'admin' | 'mapper' | 'modder' | 'spectator';
