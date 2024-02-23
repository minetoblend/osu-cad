import { HitObject, Vec2 } from '@osucad/common';
import { Graphics } from 'pixi.js';

export interface SnapProvider {
  snap(positions: Vec2[], hitObjects: HitObject[]): SnapResult[];
}

export interface SnapResult {
  offset: Vec2;
  position: Vec2;
  draw?: (g: Graphics) => void;
}
