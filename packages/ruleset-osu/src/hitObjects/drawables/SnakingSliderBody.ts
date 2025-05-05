import { Bindable, clamp, resolved, Vec2 } from "@osucad/framework";
import { DrawableSlider } from "./DrawableSlider";
import { SliderBody } from "./SliderBody";

export class SnakingSliderBody extends SliderBody {
  currentCurve: Vec2[] = [];

  readonly snakingIn = new Bindable(false);
  readonly snakingOut = new Bindable(false);

  #snakedStart?: number;
  #snakedEnd?: number;

  get snakedStart() {
    return this.#snakedStart;
  }

  get snakedEnd() {
    return this.#snakedEnd;
  }

  override get pathRadius() {
    return super.pathRadius;
  }

  override set pathRadius(value: number) {
    if (super.pathRadius === value)
      return;

    super.pathRadius = value;

    this.refresh();
  }

  @resolved(() => DrawableSlider)
  protected drawableSlider!: DrawableSlider;

  updateProgress(completionProgress: number) {
    if (!this.drawableSlider.hitObject)
      return;

    const slider = this.drawableSlider.hitObject;

    const span = slider.spanAt(completionProgress);
    const spanProgress = slider.progressAt(completionProgress);

    let start = 0;
    let end = this.snakingIn.value ? clamp((this.time.current - (slider.startTime - slider.timePreempt)) / (slider.timePreempt / 3), 0, 1) : 1;

    if (span >= slider.spanCount() - 1) {
      if (Math.min(span, slider.spanCount() - 1) % 2 === 1) {
        start = 0;
        end = this.snakingOut.value ? spanProgress : 1;
      }
      else {
        start = this.snakingOut.value ? spanProgress : 0;
      }
    }

    this.#setRange(start, end);
  }

  refresh() {
    if (!this.drawableSlider.hitObject)
      return;

    const slider = this.drawableSlider.hitObject;

    this.setVertices(this.currentCurve = slider.path.getRange(0, 1));
  }

  #setRange(p0: number, p1: number)  {
    if (p0 > p1)
      [p0, p1] = [p1, p0];

    if (this.snakedStart === p0 && this.snakedEnd === p1)
      return;

    this.#snakedStart = p0;
    this.#snakedEnd = p1;

    const slider = this.drawableSlider.hitObject;

    const range = slider.path.getRange(p0, p1);

    this.setVertices(this.currentCurve = range);
  }
}