import { SerializedHitObject } from '../types';
import { HitObject, HitObjectUpdateType } from './hitObject';
import { deserializeHitObject } from './deserializeHitObject';
import {
  SerializedBeatmapDifficulty,
  SerializedBeatmapGeneral,
} from '../protocol';
import { ControlPointManager } from './controlPointManager';
import { Action, Vec2 } from 'osucad-framework';
import { Slider } from './slider';
import { HitCircle } from './hitCircle';
import { Spinner } from './spinner';
import { binarySearch } from '../util';
import { ControlPoint, ControlPointUpdateFlags } from './controlPoint';
import { Beatmap } from './beatmap';
import { Color } from 'pixi.js';

export class HitObjectManager {
  public hitObjects: HitObject[];

  private _hitObjectMap = new Map<string, HitObject>();

  constructor(
    hitObjects: SerializedHitObject[],
    private readonly beatmap: {
      controlPoints: ControlPointManager;
      difficulty: SerializedBeatmapDifficulty;
      general: SerializedBeatmapGeneral;
      colors: number[];
    },
  ) {
    this.hitObjects = hitObjects.map((hitObject) =>
      deserializeHitObject(hitObject),
    );
    this.hitObjects.forEach((hitObject) => this._onAdd(hitObject, true));
    this._invalidateCombos();
    this.calculateStacking(
      this.hitObjects,
      this.beatmap.general.stackLeniency,
      3,
      0,
      this.hitObjects.length - 1,
    );

    this.beatmap.controlPoints.onAdded.addListener(this._onControlPointAdded);
    this.beatmap.controlPoints.onRemoved.addListener(
      this._onControlPointRemoved,
    );
    this.beatmap.controlPoints.onUpdated.addListener(
      this._onControlPointUpdated,
    );
  }

  stackingDirty = false;
  comboNumbersDirty = false;

  private _onAdd(hitObject: HitObject, isInit = false) {
    this._hitObjectMap.set(hitObject.id, hitObject);
    hitObject.applyDefaults(
      this.beatmap.difficulty,
      this.beatmap.controlPoints,
    );
    hitObject.onUpdate.addListener((key) => {
      this._onUpdate(hitObject, key);
    });

    this._invalidateStacking();
    this._invalidateCombos();

    if (!isInit) {
      this.sortHitObjects();
    }

    this.onAdded.emit(hitObject);
  }

  add(hitObject: HitObject) {
    this.hitObjects.push(hitObject);
    this._onAdd(hitObject);
  }

  remove(hitObject: HitObject) {
    const index = this.hitObjects.indexOf(hitObject);
    if (index === -1) return;
    this.hitObjects.splice(index, 1);
    this._onRemove(hitObject);
  }

  private _onRemove(hitObject: HitObject) {
    this._hitObjectMap.delete(hitObject.id);
    hitObject.onUpdate.removeAllListeners();
    this.stackingDirty = true;
    this._invalidateCombos();
    this.onRemoved.emit(hitObject);
  }

  private _onUpdate(hitObject: HitObject, key: HitObjectUpdateType) {
    switch (key) {
      case 'startTime':
        this.sortHitObjects();
        this._invalidateCombos();
        this._invalidateStacking();
        break;
      case 'newCombo':
        this._invalidateCombos();
        break;
      case 'position':
        this._invalidateStacking();
    }
    this.onUpdated.emit([hitObject, key]);
  }

  private sortHitObjects() {
    this.hitObjects.sort((a, b) => a.startTime - b.startTime);
  }

  serialize(): SerializedHitObject[] {
    return this.hitObjects.map((it) => it.serialize());
  }

  calculateCombos() {
    if (!this.comboNumbersDirty) return;

    let comboIndex = 0;
    let indexInCombo = 0;

    let forceNewCombo = false;
    for (const hitObject of this.hitObjects) {
      if (hitObject instanceof Spinner) {
        forceNewCombo = true;
      } else if (hitObject.isNewCombo || forceNewCombo) {
        comboIndex += 1 + hitObject.comboOffset;
        indexInCombo = 0;

        forceNewCombo = false;
      }

      const anyChanged =
        hitObject.comboIndex !== comboIndex ||
        hitObject.indexInCombo !== indexInCombo;

      hitObject.comboIndex = comboIndex;
      hitObject.indexInCombo = indexInCombo;
      hitObject.comboColor =
        new Color(this.beatmap.colors[comboIndex % this.beatmap.colors.length]);

      indexInCombo++;

      if (anyChanged) {
        hitObject.onUpdate.emit('combo');
      }
    }
  }

  get first(): HitObject | undefined {
    return this.hitObjects[0];
  }

  get last(): HitObject | undefined {
    return this.hitObjects[this.hitObjects.length - 1];
  }

  private calculateStacking(
    hitObjects: HitObject[],
    stackLeniency: number,
    stackDistance: number,
    startIndex: number = 0,
    endIndex: number = hitObjects.length - 1,
  ) {
    let extendedEndIndex = endIndex;
    const alteredObjects = new Set<HitObject>();
    for (let i = startIndex; i <= endIndex; i++) {
      hitObjects[i].stackHeight = 0;
      hitObjects[i].stackRoot = undefined;
    }
    if (stackLeniency === 0) return;

    performance.mark('calculateStacking-start');

    if (endIndex < hitObjects.length - 1) {
      for (let i = endIndex; i >= startIndex; i--) {
        let stackBaseIndex = i;
        for (let n = stackBaseIndex + 1; n < hitObjects.length; n++) {
          const stackBaseObject = hitObjects[stackBaseIndex];
          const objectN = hitObjects[n];

          const endTime = stackBaseObject.endTime;
          const stackThreshold = objectN.timePreempt * stackLeniency;

          if (objectN.startTime - endTime > stackThreshold) break;

          if (
            Vec2.distance(stackBaseObject.position, objectN.position) <
              stackDistance ||
            (stackBaseObject instanceof Slider &&
              Vec2.distance(stackBaseObject.endPosition, objectN.position) <
                stackDistance)
          ) {
            stackBaseIndex = n;
            objectN.stackHeight = 0;
            objectN.stackRoot = undefined;
            alteredObjects.add(objectN);
          }
        }

        if (stackBaseIndex > extendedEndIndex) {
          extendedEndIndex = stackBaseIndex;
          if (extendedEndIndex === hitObjects.length - 1) break;
        }
      }
    }

    let extendedStartIndex = startIndex;
    for (let i = extendedEndIndex; i >= extendedStartIndex; i--) {
      let n = i;

      let objectI = hitObjects[i];
      if (objectI.stackHeight !== 0 || objectI instanceof Spinner) continue;

      const stackThreshold = objectI.timePreempt * stackLeniency;

      if (objectI instanceof HitCircle) {
        while (--n >= 0) {
          const objectN = hitObjects[n];
          if (objectN instanceof Spinner) continue;

          const endTime = objectN.endTime;

          if (objectI.startTime - endTime > stackThreshold) break;

          if (n < extendedStartIndex && objectN.stackRoot === objectI.id) {
            extendedStartIndex = n;
            objectN.stackHeight = 0;
            objectN.stackRoot = undefined;
            alteredObjects.add(objectN);
          }

          if (
            objectN instanceof Slider &&
            Vec2.distance(objectN.endPosition, objectI.position) < stackDistance
          ) {
            const offset = objectI.stackHeight - objectN.stackHeight + 1;

            for (let j = n + 1; j <= i; j++) {
              const objectJ = hitObjects[j];
              if (
                Vec2.distance(objectN.endPosition, objectJ.position) <
                stackDistance
              ) {
                objectJ.stackHeight -= offset;
                objectJ.stackRoot = objectN.id;
                alteredObjects.add(objectJ);
              }
            }

            break;
          }

          if (
            Vec2.distance(objectN.position, objectI.position) < stackDistance
          ) {
            objectN.stackHeight = objectI.stackHeight + 1;
            objectN.stackRoot = objectI.id;
            alteredObjects.add(objectN);
            objectI = objectN;
          }
        }
      } else if (objectI instanceof Slider) {
        while (--n >= startIndex) {
          const objectN = hitObjects[n];

          if (objectI.startTime - objectN.endTime > stackThreshold) break;

          if (
            Vec2.distance(objectN.endPosition, objectI.position) < stackDistance
          ) {
            objectN.stackHeight = objectI.stackHeight + 1;
            alteredObjects.add(objectN);
            objectI = objectN;
          }
        }
      }
    }

    for (const object of alteredObjects) {
      object.onUpdate.emit('stackHeight');
    }

    performance.mark('calculateStacking-end');
    performance.measure(
      'calculateStacking',
      'calculateStacking-start',
      'calculateStacking-end',
    );
  }

  private _invalidateStacking() {
    this.stackingDirty = true;
  }

  private _invalidateCombos() {
    this.comboNumbersDirty = true;
  }

  updateStacking() {
    if (!this.stackingDirty) return;
    this.calculateStacking(
      this.hitObjects,
      this.beatmap.general.stackLeniency,
      3,
      0,
      this.hitObjects.length - 1,
    );
    this.stackingDirty = false;
  }

  getById(id: string): HitObject | undefined {
    return this._hitObjectMap.get(id);
  }

  readonly onRemoved = new Action<HitObject>();
  readonly onAdded = new Action<HitObject>();
  readonly onUpdated = new Action<[HitObject, HitObjectUpdateType]>();

  getAtTime(time: number): HitObject | undefined {
    const { found, index } = binarySearch(
      time,
      this.hitObjects,
      (it) => it.startTime,
    );
    if (found) return this.hitObjects[index];
    if (index === 0) return undefined;
    const hitObject = this.hitObjects[index - 1];
    if (hitObject.endTime > time) return hitObject;
    return undefined;
  }

  _onControlPointAdded = () => {
    this.hitObjects.forEach((hitObject) =>
      hitObject.applyDefaults(
        this.beatmap.difficulty,
        this.beatmap.controlPoints,
      ),
    );
  };

  _onControlPointRemoved = () => {
    this.hitObjects.forEach((hitObject) =>
      hitObject.applyDefaults(
        this.beatmap.difficulty,
        this.beatmap.controlPoints,
      ),
    );
  };

  _onControlPointUpdated = (
    controlPoint: ControlPoint,
    flags: ControlPointUpdateFlags,
  ) => {
    if (
      flags &
      (ControlPointUpdateFlags.StartTime |
        ControlPointUpdateFlags.Velocity |
        ControlPointUpdateFlags.Timing)
    ) {
      this.hitObjects.forEach((hitObject) =>
        hitObject.applyDefaults(
          this.beatmap.difficulty,
          this.beatmap.controlPoints,
        ),
      );
    }
  };
}
