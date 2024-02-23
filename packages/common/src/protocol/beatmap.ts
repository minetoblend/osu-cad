import {SerializedEditorBookmark, SerializedHitObject, UserInfo,} from "../types";
import {SerializedHitSounds} from "../osu/hitSoundManager";
import {SerializedControlPoint} from "../osu/controlPoint";


export type MapsetId = string;

export interface SerializedMapset {
  id: MapsetId;
  metadata: SerializedMapsetMetadata;
  creator: UserInfo;
}

export interface SerializedMapsetMetadata {
  title: string;
  artist: string;
  tags: string;
}

export type BeatmapId = string;

export interface SerializedBeatmap {
  id: BeatmapId;
  setId: MapsetId;
  metadata: SerializedMapsetMetadata;
  name: string;
  hitObjects: SerializedHitObject[];
  controlPoints: SerializedControlPoints;
  difficulty: SerializedBeatmapDifficulty;
  bookmarks: SerializedEditorBookmark[];
  backgroundPath: string | null;
  colors: string[];
  audioFilename: string;
  general: SerializedBeatmapGeneral;
  hitSounds: SerializedHitSounds;
}

export interface SerializedControlPoints {
  controlPoints: SerializedControlPoint[];
}

export interface SerializedBeatmapDifficulty {
  hpDrainRate: number;
  circleSize: number;
  overallDifficulty: number;
  approachRate: number;
  sliderMultiplier: number;
  sliderTickRate: number;
}

export interface SerializedBeatmapGeneral {
  stackLeniency: number;
}