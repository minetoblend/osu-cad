import {
  BeatmapDifficulty,
  TimingPoint,
  TimingPointCollection,
  Vec2,
} from "@osucad/common";
import { ref, shallowRef } from "vue";
import { Rectangle, IHitArea } from "pixi.js";
import { Circle } from "./circle";
import { Slider } from "./slider";
import { SharedMap } from "@osucad/unison";

export type HitObject = Circle | Slider;

export const OBJECT_RADIUS = 64;

export abstract class HitObjectBase extends SharedMap implements IHitArea {
  initializeFirstTime(): void {
    this.set("position", { x: 0, y: 0 });
    this.set("startTime", 0);
    this.set("newCombo", false);
  }

  get position() {
    return this.get("position") as Vec2;
  }

  set position(value: Vec2) {
    this.set("position", value);
  }

  get stackedPosition() {
    return Vec2.sub(this.position, {
      x: this.stackHeight.value * 3,
      y: this.stackHeight.value * 3,
    });
  }

  get startTime() {
    return this.get("startTime") as number;
  }

  set startTime(value: number) {
    this.set("startTime", value);
  }

  get endTime() {
    return this.startTime;
  }

  get newCombo() {
    return this.get("newCombo") as boolean;
  }

  set newCombo(value: boolean) {
    this.set("newCombo", value);
  }

  #comboIndex = ref(0);
  #comboNumber = ref(0);

  get comboIndex() {
    return this.#comboIndex.value;
  }

  set comboIndex(value: number) {
    this.#comboIndex.value = value;
  }

  get comboNumber() {
    return this.#comboNumber.value;
  }

  set comboNumber(value: number) {
    this.#comboNumber.value = value;
  }

  private _scale = shallowRef<number>(1);

  get scale() {
    return this._scale.value;
  }

  get radius() {
    return this._scale.value * OBJECT_RADIUS;
  }

  applyDefaults(timing: TimingPointCollection, difficulty: BeatmapDifficulty) {
    this._scale.value = (1.0 - (0.7 * (difficulty.circleSize - 5)) / 5) / 2;
  }

  protected _bounds = shallowRef<Rectangle>();

  /**
   * The bounds of the hit object *without* the radius.
   */
  get bounds() {
    if (!this._bounds.value) this._bounds.value = this.calculateBounds();

    return this._bounds.value;
  }

  protected abstract calculateBounds(): Rectangle;

  abstract contains(x: number, y: number): boolean;

  onChange(key: string, value: unknown): void {
    if (key === "position" && this._bounds) {
      this._bounds.value = undefined;
    }
  }

  stackHeight = ref(0);

  stackedOn = new Set<HitObject>();

  stackedUnder: HitObject | null = null;
}
