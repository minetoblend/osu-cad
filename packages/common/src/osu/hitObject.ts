import { Action, Comparer, Vec2 } from 'osucad-framework';
import { SerializedBeatmapDifficulty } from '../protocol';
import { Attribution, SerializedHitObject } from '../types';
import { randomString } from '../util';
import { ControlPointManager } from './controlPointManager';
import { HitSample, HitSound, defaultHitSound } from './hitSound';
import { Color } from 'pixi.js';

export function hitObjectId() {
  return randomString(8);
}

export abstract class HitObject {
  constructor(options?: SerializedHitObject) {
    if (options) {
      if (options.id) this.id = options.id;
      this.startTime = options.startTime;
      this.position = new Vec2(options.position.x, options.position.y);
      this.attribution = options.attribution;
      this.isNewCombo = options.newCombo;
      this.comboOffset = options.comboOffset ?? 0;
      if (options.hitSound) this._hitSound = { ...options.hitSound };
    }
  }

  abstract readonly type: HitObjectType;

  id: string = hitObjectId();

  comboOffset = 0;

  isGhost = false;

  protected _version = 0;
  get version() {
    return this._version;
  }

  private _position = new Vec2(0, 0);

  get position(): Vec2 {
    return this._position;
  }

  protected _hitSound: HitSound = defaultHitSound();

  get hitSound() {
    return this._hitSound;
  }

  set hitSound(value: HitSound) {
    this._hitSound = value;
    this._hitSamples = undefined;
    this._onUpdate('hitSounds');
  }

  set position(value: Vec2) {
    if (Vec2.equals(value, this._position)) return;
    this._position = value;
    this._stackedPosition = undefined;
    this._onUpdate('position');
  }

  private _startTime: number = 0;

  get startTime(): number {
    return this._startTime;
  }

  set startTime(value: number) {
    if (value === this._startTime) return;
    this._startTime = value;
    this._onUpdate('startTime');
  }

  abstract duration: number;

  attribution?: Attribution;

  get endTime(): number {
    return this.startTime + this.duration;
  }

  get endPosition(): Vec2 {
    return this.position;
  }

  comboIndex = 0;
  indexInCombo = 0;
  scale = 1;
  timePreempt = 0;
  timeFadeIn = 0;

  comboColor = new Color(0xffffff);

  private _stackHeight = 0;

  get stackHeight(): number {
    return this._stackHeight;
  }

  set stackHeight(value: number) {
    if (value === this._stackHeight) return;
    this._stackHeight = value;
    this._stackedPosition = undefined;
  }

  stackRoot?: string;

  applyDefaults(
    difficulty: SerializedBeatmapDifficulty,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    controlPoints: ControlPointManager,
  ) {
    this.scale = (1.0 - (0.7 * (difficulty.circleSize - 5)) / 5) / 2;
    this.timePreempt = difficultyRange(
      difficulty.approachRate,
      1800,
      1200,
      450,
    );
    this.timeFadeIn = 400 * Math.min(1, this.timePreempt, 400);
  }

  private _isNewCombo: boolean = false;

  get isNewCombo(): boolean {
    return this._isNewCombo;
  }

  set isNewCombo(value: boolean) {
    this._isNewCombo = value;
    this._onUpdate('newCombo');
  }

  abstract serialize(): SerializedHitObject;

  onUpdate = new Action<HitObjectUpdateType>();

  private _stackedPosition?: Vec2;

  get stackedPosition(): Vec2 {
    //if (this._stackedPosition) return this._stackedPosition;
    this._stackedPosition = Vec2.sub(
      this.position,
      new Vec2(this.stackHeight * 3, this.stackHeight * 3),
    );
    return this._stackedPosition;
  }

  depthInfo = {
    position: new Vec2(),
    scale: 1,
  };

  patch(update: Partial<SerializedHitObject>) {
    if (update.newCombo !== undefined) this.isNewCombo = update.newCombo;
    if (update.position !== undefined)
      this.position = new Vec2(update.position.x, update.position.y);
    if (update.startTime !== undefined) this.startTime = update.startTime;
    if (update.hitSound !== undefined) this.hitSound = update.hitSound;
  }

  get radius(): number {
    return 59 * this.scale;
  }

  abstract contains(point: Vec2): boolean;

  private _isSelected = false;
  get isSelected(): boolean {
    return this._isSelected;
  }

  set isSelected(value: boolean) {
    this._isSelected = value;
    this.onUpdate.emit('selected');
  }

  protected _hitSamples?: HitSample[];

  get hitSamples(): HitSample[] {
    if (this._hitSamples === undefined)
      this._hitSamples = this.calculateHitSamples();
    return this._hitSamples;
  }

  isVisibleAtTime(time: number) {
    if (time <= this.startTime - this.timePreempt) return false;
    if (time >= this.endTime + 700) return false;

    return true;
  }

  abstract calculateHitSamples(): HitSample[];

  protected updateHitSounds() {}

  protected _onUpdate(update: HitObjectUpdateType) {
    this._version++;
    this.onUpdate.emit(update);
  }
}

export type HitObjectUpdateType =
  | 'startTime'
  | 'position'
  | 'newCombo'
  | 'stackHeight'
  | 'selected'
  | 'combo'
  | 'repeats'
  | 'velocity'
  | 'duration'
  | 'hitSounds';

function difficultyRange(
  diff: number,
  min: number,
  mid: number,
  max: number,
): number {
  if (diff > 5) {
    return mid + ((max - mid) * (diff - 5)) / 5;
  }

  if (diff < 5) {
    return mid - ((mid - min) * (5 - diff)) / 5;
  }

  return mid;
}

export const enum HitObjectType {
  Circle = 1,
  Slider = 2,
  Spinner = 3,
}

export class HitObjectComparer extends Comparer<HitObject> {
  compare(a: HitObject, b: HitObject): number {
    return a.startTime - b.startTime;
  }
}
