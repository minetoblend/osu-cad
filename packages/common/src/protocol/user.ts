import {Presence} from "./presence";
import {UserInfo} from "../types";

export type UserId = number;

export interface UserSessionInfo extends UserInfo {
  sessionId: number;
  role: UserRole;
  presence: Presence;
}

export type UserRole = "admin" | "mapper" | "modder" | "spectator";

