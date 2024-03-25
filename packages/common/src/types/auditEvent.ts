import { UserInfo } from './userInfo';

export interface AuditEvents {
  login: object;
  logout: object;
  'mapset.import': {
    mapsetId: string;
    title: string;
  };
  'beatmap.delete': {
    beatmapId: string;
    mapsetId: string;
    title: string;
  };
  'room.join': {
    beatmapId: string;
    mapsetId: string;
    title: string;
    access: number;
  };
  'room.leave': {
    beatmapId: string;
    mapsetId: string;
    title: string;
  };
}

export type AuditAction = keyof AuditEvents;

export type AuditDetails<T extends AuditAction> = AuditEvents[T];

export interface AuditEventInfo<T extends AuditAction = AuditAction> {
  id: number;
  timestamp: string;
  user: UserInfo;
  action: T;
  details: AuditDetails<T>;
}
