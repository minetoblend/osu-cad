import { UserInfo } from './userInfo';
import { SerializedHitObject } from './hitobject';
import {
  BeatmapAccess,
  SerializedBeatmapDifficulty,
  SerializedBeatmapGeneral,
} from '../protocol';
import { SerializedHitSounds } from '../osu';
import { SerializedTimingPoint, SerializedVelocityPoint } from './timingPoint';

export interface MapsetInfo {
  id: string;
  title: string;
  artist: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  beatmaps: MapsetBeatmapInfo[];
  creator: UserInfo;
  links: {
    self: string;
    thumbnailSmall: string | null;
    thumbnailLarge: string | null;
  };
}

export interface MapsetBeatmapInfo {
  id: string;
  name: string;
  starRating: number;
  creator: UserInfo;
  lastEdited?: string;
  links: {
    self: string;
    edit: string;
    thumbnailSmall: string | null;
    thumbnailLarge: string | null;
    audioUrl: string;
  };
}

export interface BeatmapInfo {
  id: string;
  setId: string;
  title: string;
  artist: string;
  version: string;
  starRating: number;
  lastEdited: string;
  access: BeatmapAccess;
  isOwner: boolean;
  creator: UserInfo;
  links: {
    view: string;
    edit: string;
    thumbnailSmall: string | null;
    thumbnailLarge: string | null;
    audioUrl: string;
  };
}

export interface BeatmapData {
  version: number;
  hitObjects: SerializedHitObject[];
  controlPoints: {
    timing: SerializedTimingPoint[];
    velocity: SerializedVelocityPoint[];
  };
  colors: string[];
  bookmarks: SerializedEditorBookmark[];
  backgroundPath: string | null;
  difficulty: SerializedBeatmapDifficulty;
  audioFilename: string;
  general: SerializedBeatmapGeneral;
  hitSounds: SerializedHitSounds;
}

export interface SerializedEditorBookmark {
  time: number;
  name: string | null;
}
