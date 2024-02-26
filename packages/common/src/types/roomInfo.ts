import { UserSessionInfo } from '../protocol';

export interface RoomInfo {
  createdAt: number;
  beatmap: {
    id: string;
    name: string;
    links: {
      thumbnail: {
        href: string;
      } | null;
      edit: {
        href: string;
      };
    };
  };
  mapset: {
    id: string;
    artist: string;
    title: string;
  };
  userCount: number;
  users: UserSessionInfo[];
}
