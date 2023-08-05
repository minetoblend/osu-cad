import {ref} from "vue";
import {Rectangle, IHitArea} from "pixi.js";
import {
  IMapSnapshotData,
  IObjectAttributes,
  IObjectSnapshot,
  ITypeFactory,
  IUnisonRuntime,
  SharedObject,
} from "@osucad/unison";
import {PathPoint, SliderPath} from "./sliderPath";
import {HitObjectBase} from "./hitObject";
import {Vec2} from "./vec2";
import {BeatmapDifficulty} from "./difficulty";
import {TimingPointCollection} from "./timingPointCollection";
import {
  ControlPointList,
  ControlPointListFactory,
  IControlPointListSnapshotData,
} from "./controlPointList";

const BASE_SCORING_DISTANCE = 100;

export interface ISliderSnapshotData {
  controlPoints: IControlPointListSnapshotData;
  data: Record<string, any>;
}

export class Slider extends HitObjectBase implements IHitArea {
  constructor(runtime: IUnisonRuntime) {
    super(runtime, SliderFactory.Attributes);
  }

  sliderPath!: SliderPath;

  initializeFirstTime(): void {
    super.initializeFirstTime();
    const controlPoints = new ControlPointListFactory().create(this.runtime);
    this.set("controlPoints", controlPoints);
    this.set("expectedDistance", 0);
    this.set("spans", 1);
    this.set("velocityMultiplier", 1);
    this.sliderPath = new SliderPath(controlPoints);

    controlPoints.on("change", () => (this._bounds.value = undefined));
  }

  get controlPoints() {
    return this.get("controlPoints") as ControlPointList;
  }

  get expectedDistance() {
    return this.get("expectedDistance") as number;
  }

  get endPosition(): Vec2 {
    if (this.spans % 2 == 1) {
      return this.pathEndPosition;
    } else {
      return this.position;
    }
  }

  set expectedDistance(value: number) {
    this.set("expectedDistance", value);
  }

  private _velocity = ref(1);

  get velocity() {
    return this._velocity.value * this.velocityMultiplier;
  }

  get spans() {
    return this.get("spans") as number;
  }

  set spans(value: number) {
    this.set("spans", value);
  }

  get spanDuration() {
    return this.expectedDistance / this.velocity;
  }

  get duration() {
    return this.spanDuration * this.spans;
  }

  get endTime() {
    return this.startTime + this.duration;
  }

  get velocityMultiplier() {
    return (this.get("velocityMultiplier") as number) ?? 1;
  }

  set velocityMultiplier(value: number) {
    this.set("velocityMultiplier", value);
  }

  getChild(key: string): SharedObject<unknown, unknown> | undefined {
    if (key === "controlPoints") return this.controlPoints;
    return undefined;
  }

  getChildren(): SharedObject<unknown, unknown>[] {
    return [this.controlPoints];
  }

  applyDefaults(
    timing: TimingPointCollection,
    difficulty: BeatmapDifficulty,
  ): void {
    super.applyDefaults(timing, difficulty);

    const timingPoint = timing.getTimingPointAt(this.startTime, false);

    const beatLength =
      (timingPoint && !timingPoint.isInherited
        ? timingPoint.beatDuration
        : timing.getTimingPointAt(this.startTime, true)?.beatDuration) ??
      60_000 / 120;

    const scoringDistance =
      BASE_SCORING_DISTANCE *
      difficulty.sliderMultiplier *
      (timingPoint?.velocity ?? 1);

    this._velocity.value = scoringDistance / beatLength;
  }

  protected calculateBounds(): Rectangle {
    const rect = this.sliderPath.getBounds().getRectangle().clone();
    rect.x += this.position.x;
    rect.y += this.position.y;
    return rect;
  }

  get pathEndPosition() {
    return Vec2.add(this.position, this.sliderPath.endPosition);
  }

  getProgressAtTime(time: number) {
    if (time < this.startTime) return 0;
    if (time > this.endTime) return this.spans % 2;
    const relative = (time - this.startTime) / this.spanDuration;
    const spanIndex = Math.floor(relative);
    const progressInSpan = relative % 1;

    if (spanIndex % 2 === 0) return progressInSpan;
    return 1 - progressInSpan;
  }

  contains(x: number, y: number): boolean {
    const radiusSq = this.radius * this.radius;
    const path = this.sliderPath.calculatedPath;
    const cumulativeDistance = this.sliderPath.cumulativeDistance;

    x -= this.position.x;
    y -= this.position.y;

    const endDistance = this.expectedDistance;
    const stepSize = this.radius * 0.25;

    let curDistance = 0;

    for (let i = 0; i < path.length; i++) {
      const distance = cumulativeDistance[i];
      if (distance < curDistance + stepSize) {
        continue;
      }
      do {
        curDistance += stepSize;
        const pos = this.sliderPath.interpolateVertices(i, curDistance);

        if (Vec2.lengthSquared({ x: x - pos.x, y: y - pos.y }) < radiusSq)
          return true;
      } while (curDistance < distance);
    }

    return false;
  }

  get pathEndposition() {
    return Vec2.add(
      this.position,
      this.sliderPath.calculatedPath[
      this.sliderPath.calculatedPath.length - 1
        ] ?? Vec2.zero(),
    );
  }

  onChange(key: string, value: unknown): void {
    super.onChange(key, value);
    if (key === "controlPoints" && this.sliderPath) {
      this._bounds.value = undefined;
    }
    if (this.sliderPath && key === "expectedDistance" && typeof value === "number")
      this.sliderPath.expectedDistance = value;
  }
}

export class SliderFactory implements ITypeFactory<Slider> {
  static readonly Type = "@osucad/slider";

  get type() {
    return SliderFactory.Type;
  }

  static readonly Attributes: IObjectAttributes = {
    type: SliderFactory.Type,
    version: "0.1",
  };

  get attributes() {
    return SliderFactory.Attributes;
  }

  create(runtime: IUnisonRuntime): Slider {
    return new Slider(runtime);
  }

  get circleRadius() {
    return 32;
  }
}
