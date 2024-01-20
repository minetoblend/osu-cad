import {HitObject, HitObjectType} from "./hitObject";
import {SerializedSlider} from "../types";
import {SerializedBeatmapDifficulty} from "../protocol";
import {ControlPointManager} from "./controlPointManager";
import {SliderPath} from "./sliderPath";
import {Vec2} from "../math";
import {defaultHitSound, getSamples, HitSample, HitSound, SampleSet, SampleType} from "./hitSound";

export class Slider extends HitObject {

  readonly type = HitObjectType.Slider;

  constructor(options?: SerializedSlider) {
    super(options);

    if (options) {
      this.repeats = options.repeats;
      this.velocityOverride = options.velocity;
      this.path = new SliderPath(options.path, options.expectedDistance);

      if (options.hitSounds)
        this.hitSounds = options.hitSounds;

      this._updateHitSounds();
    }
  }


  get expectedDistance() {
    return this.path.expectedDistance;
  }

  set expectedDistance(value: number) {
    this.path.expectedDistance = value;
  }

  private _repeats = 0;
  get repeats() {
    return this._repeats;
  }

  set repeats(value: number) {
    if (value === this._repeats) return;
    this._repeats = value;
    this.onUpdate.emit("repeats");
    this._updateHitSounds();
  }

  private _hitSounds: HitSound[] = [];
  get hitSounds() {
    return this._hitSounds;
  }

  set hitSounds(value: HitSound[]) {
    this._hitSounds = value;
    this._hitSamples = undefined;
    this.onUpdate.emit("hitSounds");
  }

  private _velocityOverride: number | null = null;

  get velocityOverride() {
    return this._velocityOverride;
  }

  set velocityOverride(value: number | null | undefined) {
    if (value === this._velocityOverride) return;
    this._velocityOverride = value ?? null;
    this.onUpdate.emit("velocity");
  }

  path = new SliderPath();

  private inheritedVelocity = 1;

  get velocity() {
    return this.velocityOverride ?? this.inheritedVelocity;
  }

  get spanDuration() {
    return this.expectedDistance / this.velocity;
  }

  get duration() {
    return this.spanDuration * this.spans;
  }

  get spans() {
    return this.repeats + 1;
  }

  set spans(value: number) {
    this.repeats = value - 1;
  }

  applyDefaults(difficulty: SerializedBeatmapDifficulty, controlPoints: ControlPointManager) {
    super.applyDefaults(difficulty, controlPoints);
    const timingPoint = controlPoints.timingPointAt(this.startTime);

    const scoringDistance = 100 * difficulty.sliderMultiplier * controlPoints.getVelocityAt(this.startTime);

    this.inheritedVelocity = scoringDistance / timingPoint.beatLength;
  }

  serialize(): SerializedSlider {
    return {
      id: this.id,
      type: "slider",
      path: this.path.controlPoints,
      position: this.position,
      newCombo: this.isNewCombo,
      startTime: this.startTime,
      attribution: this.attribution,
      repeats: this.repeats,
      expectedDistance: this.expectedDistance,
      comboOffset: this.comboOffset,
      velocity: this.velocityOverride,
      hitSound: { ...this.hitSound },
      hitSounds: this.hitSounds.map(s => ({ ...s })),
    };
  }

  override get endPosition(): Vec2 {
    if (this.repeats % 2 == 0) return Vec2.add(this.position, this.path.endPosition);
    return this.position;
  }

  positionAt(time: number) {
    if (time < this.startTime) return Vec2.zero();
    if (time > this.endTime) return this.repeats % 2 == 0 ? this.path.endPosition : Vec2.zero();

    const spanDuration = this.spanDuration;
    const spanIndex = Math.floor((time - this.startTime) / spanDuration);
    const spanStartTime = this.startTime + spanIndex * spanDuration;

    let spanProgress = (time - spanStartTime) / spanDuration;
    if (spanIndex % 2 === 1) spanProgress = 1 - spanProgress;

    return this.path.getPositionAtDistance(spanProgress * this.expectedDistance);
  }

  angleAt(time: number) {
    if (time <= this.startTime + 1) {
      return this.angleAt(this.startTime + 1);
    }

    const pos1 = this.positionAt(time - 1);
    const pos2 = this.positionAt(time);
    return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
  }

  get startAngle() {
    const p1 = this.path.controlPoints[0];
    const p2 = this.path.getPositionAtDistance(1);
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  get endAngle() {
    const p1 = this.path.getPositionAtDistance(this.expectedDistance - 1);
    const p2 = this.path.endPosition;
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  contains(point: Vec2): boolean {
    const radiusSquared = this.radius * this.radius;
    if (Vec2.closerThanSquared(this.stackedPosition, point, radiusSquared))
      return true;
    if (Vec2.closerThanSquared(Vec2.add(this.stackedPosition, this.path.endPosition), point, radiusSquared))
      return true;

    point = Vec2.sub(point, this.stackedPosition);

    const path = this.path.calculatedRange;
    let distance = 0;
    const step = 10;
    let i = 1;
    while (distance < this.path.expectedDistance) {
      distance += step;
      while (i < path.length - 1 && this.path.cumulativeDistance[i] < distance)
        i++;

      let p1 = path[i - 1];
      let p2 = path[i];
      let d1 = this.path.cumulativeDistance[i - 1];
      let d2 = this.path.cumulativeDistance[i];
      let t = (distance - d1) / (d2 - d1);
      let x = p1.x + (p2.x - p1.x) * t;
      let y = p1.y + (p2.y - p1.y) * t;

      if (Vec2.closerThanSquared(new Vec2(x, y), point, radiusSquared))
        return true;
    }

    return false;
  }

  patch(update: Partial<SerializedSlider>) {
    super.patch(update);
    if (update.path !== undefined) {
      this.path.controlPoints = update.path;
      this.path.invalidate();
      this.onUpdate.emit("position");
    }
    if (update.expectedDistance !== undefined) {
      this.path.expectedDistance = update.expectedDistance;
      this.path.invalidate();
      this.onUpdate.emit("position");
    }
    if (update.repeats !== undefined) {
      this.repeats = update.repeats;
    }
    if (update.velocity !== undefined) {
      this.velocityOverride = update.velocity;
    }
    if (update.hitSounds !== undefined) {
      this.hitSounds = update.hitSounds;
    }
  }

  calculateHitSamples(): HitSample[] {
    return [
      //...getSamples(this.hitSound, this.startTime),
      ...this.hitSounds.flatMap((hitSound, i) => {
        return getSamples(hitSound, this.startTime + i * this.spanDuration);
      }),
    ];
  }

  protected override _updateHitSounds() {
    if (this._hitSounds.length === this.spans + 1) return;
    if (this._hitSounds.length > this.spans + 1) {
      const last = this._hitSounds[this._hitSounds.length - 1] ?? defaultHitSound();
      this._hitSounds.length = this.spans + 1;
      this._hitSounds[this._hitSounds.length - 1] = last;
      this.onUpdate.emit("hitSounds");
    } else {
      const last = this._hitSounds[this._hitSounds.length - 1] ?? defaultHitSound();
      while (this._hitSounds.length < this.spans + 1) {
        this._hitSounds.push(last);
      }
      this.onUpdate.emit("hitSounds");
    }

  }

}