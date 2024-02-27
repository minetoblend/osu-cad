import { UserSessionInfo } from './user';
import { BeatmapAccess, SerializedBeatmap } from './beatmap';
import { ChatHistory, ChatMessage } from './chat';
import { UserActivity } from './presence';

type LeaveReason = 'disconnected' | 'kicked' | 'banned';

export interface ServerMessages {
  beatmap(beatmap: SerializedBeatmap): void;

  identity(user: UserSessionInfo): void;

  connectedUsers(users: UserSessionInfo[]): void;

  chatHistory(history: ChatHistory): void;

  userJoined(user: UserSessionInfo): void;

  userLeft(user: UserSessionInfo, reason: LeaveReason): void;

  kicked(reason: string, isBan: boolean): void;

  chatMessageCreated(message: ChatMessage): void;

  chatMessageDeleted(id: number): void;

  userActivity(sessionId: number, activity: UserActivity): void;

  commands(commands: Uint8Array, sessionId: number): void;

  accessChanged(access: BeatmapAccess): void;
}
