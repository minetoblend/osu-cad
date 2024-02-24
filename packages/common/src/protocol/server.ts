import { fields, TypeNames, variantModule, VariantOf } from 'variant';
import { UserId, UserRole, UserSessionInfo } from './user';
import { BeatmapAccess, SerializedBeatmap, SerializedMapset } from './beatmap';
import { ChatHistory, ChatMessage } from './chat';
import { UserActivity } from './presence';
import { UserInfo } from '../types';

export const ServerMessage = variantModule({
  roomState: fields<{
    users: UserSessionInfo[];
    mapset: SerializedMapset;
    chat: ChatHistory;
  }>(),
  userJoined: fields<{ user: UserSessionInfo }>(),
  userLeft: fields<{ user: UserInfo; reason: LeaveReason }>(),
  kicked: fields<{ reason: string; isBan: boolean }>(),
  chatMessage: fields<ChatMessage>(),
  userActivity: fields<{ user: UserId; activity: UserActivity }>(),
  userRoleChanged: fields<{ id: UserInfo; role: UserRole }>(),
});

export type ServerMessage<
  T extends TypeNames<typeof ServerMessage> = undefined,
> = VariantOf<typeof ServerMessage, T>;

type LeaveReason = 'disconnected' | 'kicked' | 'banned';

export interface ServerMessages {
  roomState(payload: {
    users: UserSessionInfo[];
    beatmap: SerializedBeatmap;
    chat: ChatHistory;
    ownUser: UserSessionInfo;
  }): void;

  userJoined(user: UserSessionInfo): void;

  userLeft(user: UserSessionInfo, reason: LeaveReason): void;

  kicked(reason: string, isBan: boolean): void;

  chatMessage(message: ChatMessage): void;

  userActivity(sessionId: number, activity: UserActivity): void;

  userRoleChanged(id: UserInfo, role: UserRole): void;

  commands(commands: Uint8Array, sessionId: number): void;

  roll(user: UserSessionInfo): void;

  accessChanged(access: BeatmapAccess): void;
}
