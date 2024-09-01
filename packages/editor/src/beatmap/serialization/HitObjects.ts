import { type IVec2, Vec2 } from 'osucad-framework';
import type { IPathPoint } from '../hitObjects/PathPoint';
import { PathPoint } from '../hitObjects/PathPoint';
import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { HitCircle } from '../hitObjects/HitCircle';
import { Slider } from '../hitObjects/Slider';
import { Spinner } from '../hitObjects/Spinner';
import type { SerializedHitSound } from './HitSound';
import { deserializeHitSound, serializeHitSound } from './HitSound';

export interface SerializedHitObject<TType extends string = string> {
  id: string;
  startTime: number;
  type: TType;
}

export interface SerializedOsuHitObject<TType extends string = string> extends SerializedHitObject<TType> {
  position: IVec2;
  newCombo: boolean;
  comboOffset: number;
  hitSound: SerializedHitSound;
}

export interface SerializedHitCircle extends SerializedOsuHitObject<'circle'> {
}

export interface SerializedSlider extends SerializedOsuHitObject<'slider'> {
  repeatCount: number;
  velocityOverride: number | null;
  expectedDistance: number;
  controlPoints: IPathPoint[];
  hitSounds: SerializedHitSound[];
}

export interface SerializedSpinner extends SerializedOsuHitObject<'spinner'> {
  duration: number;
}

export type ToSerializedHitObject<T extends OsuHitObject> =
  T extends Slider ? SerializedSlider :
    T extends Spinner ? SerializedSpinner :
      T extends HitCircle ? SerializedHitCircle :
        SerializedOsuHitObject;

export type HitObjectPatch<T extends OsuHitObject> = Partial<ToSerializedHitObject<T>>;

function serializeBase(hitObject: OsuHitObject): Omit<SerializedOsuHitObject, 'type'> {
  return {
    id: hitObject.id,
    startTime: hitObject.startTime,
    position: hitObject.position,
    newCombo: hitObject.newCombo,
    comboOffset: hitObject.comboOffset,
    hitSound: serializeHitSound(hitObject.hitSound),
  };
}

export function serializeCircle(circle: HitCircle): SerializedHitCircle {
  return {
    ...serializeBase(circle),
    type: 'circle',
  };
}

function serializePathPoint(point: IPathPoint): IPathPoint {
  return {
    position: point.position,
    type: point.type,
  };
}

export function serializeSlider(slider: Slider): SerializedSlider {
  return {
    ...serializeBase(slider),
    type: 'slider',
    repeatCount: slider.repeatCount,
    velocityOverride: slider.velocityOverride,
    expectedDistance: slider.expectedDistance,
    controlPoints: slider.path.controlPoints.map(serializePathPoint),
    hitSounds: slider.hitSounds.map(serializeHitSound),
  };
}

export function serializeSpinner(spinner: Spinner): SerializedSpinner {
  return {
    ...serializeBase(spinner),
    type: 'spinner',
    duration: spinner.duration,
  };
}

export function serializeHitObject(hitObject: OsuHitObject) {
  if (hitObject instanceof HitCircle)
    return serializeCircle(hitObject);

  else if (hitObject instanceof Slider)
    return serializeSlider(hitObject);

  else if (hitObject instanceof Spinner)
    return serializeSpinner(hitObject);

  throw new Error('Unsupported hit object type');
}

export function deserializeHitObject(hitObject: SerializedHitObject): OsuHitObject {
  if (hitObject.type === 'circle')
    return deserializeCircle(hitObject as SerializedHitCircle);

  else if (hitObject.type === 'slider')
    return deserializeSlider(hitObject as SerializedSlider);

  else if (hitObject.type === 'spinner')
    return deserializeSpinner(hitObject as SerializedSpinner);

  throw new Error('Unsupported hit object type');
}

export function deserializeCircle(circle: SerializedHitCircle): HitCircle {
  const obj = new HitCircle();
  obj.id = circle.id;
  obj.startTime = circle.startTime;
  obj.position = Vec2.from(circle.position);
  obj.newCombo = circle.newCombo;
  obj.comboOffset = circle.comboOffset;
  obj.hitSound = deserializeHitSound(circle.hitSound);
  return obj;
}

export function deserializeSlider(slider: SerializedSlider): Slider {
  const obj = new Slider();
  obj.id = slider.id;
  obj.startTime = slider.startTime;
  obj.position = Vec2.from(slider.position);
  obj.newCombo = slider.newCombo;
  obj.comboOffset = slider.comboOffset;
  obj.hitSound = deserializeHitSound(slider.hitSound);
  obj.repeatCount = slider.repeatCount;
  obj.velocityOverride = slider.velocityOverride;
  obj.path.expectedDistance = slider.expectedDistance;
  obj.path.controlPoints = slider.controlPoints.map(deserializePathPoint);
  obj.ensureHitSoundsAreValid();
  return obj;
}

export function deserializeSpinner(spinner: SerializedSpinner): Spinner {
  const obj = new Spinner();
  obj.id = spinner.id;
  obj.startTime = spinner.startTime;
  obj.duration = spinner.duration;
  obj.comboOffset = spinner.comboOffset;
  obj.hitSound = deserializeHitSound(spinner.hitSound);
  return obj;
}

function deserializePathPoint(point: IPathPoint): PathPoint {
  return new PathPoint(Vec2.from(point.position), point.type);
}
