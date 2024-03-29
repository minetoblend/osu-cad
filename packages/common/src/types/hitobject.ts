import { IVec2 } from '../math';
import { PathType } from './pathType';
import { IHasAttribution } from './attribution';
import { HitSound } from '../osu';

export interface HitObjectBase extends IHasAttribution {
  id?: string;
  startTime: number;
  position: IVec2;
  newCombo: boolean;
  comboOffset?: number;
  hitSound?: HitSound;
}

export interface SerializedHitCircle extends HitObjectBase {
  type: 'circle';
}

export interface SerializedSlider extends HitObjectBase {
  type: 'slider';
  path: SerializedPathPoint[];
  repeats: number;
  expectedDistance: number;
  velocity: number | null;
  hitSounds?: HitSound[];
}

export interface SerializedPathPoint extends IVec2 {
  type: PathType | null;
}

export interface SerializedSpinner extends HitObjectBase {
  type: 'spinner';
  duration: number;
}

export type SerializedHitObject =
  | SerializedHitCircle
  | SerializedSlider
  | SerializedSpinner;
