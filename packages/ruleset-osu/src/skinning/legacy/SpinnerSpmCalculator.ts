import { almostEquals, BindableNumber, Component, resolved } from "@osucad/framework";
import { DrawableHitObject } from "@osucad/core";

const spm_count_duration = 595;

export class SpinnerSpmCalculator extends Component
{
  readonly #records: RotationRecord[] = [];

  readonly result = new BindableNumber();

  @resolved(DrawableHitObject)
  private drawableSpinner!: DrawableHitObject;

  protected override loadComplete()
  {
    super.loadComplete();

    this.drawableSpinner.hitObjectApplied.addListener(this.#resetState, this);
  }

  #lastRecord: RotationRecord = {
    time: 0,
    rotation: 0,
  };

  setRotation(currentRotation: number)
  {
    if (this.#records.length > 0 && this.time.current < this.#lastRecord.time)
      this.#records.length = 0;

    if (this.#records.length > 0 && almostEquals(this.time.current, this.#lastRecord.time))
      return;

    if (this.#records.length > 0)
    {
      let record = this.#records[0];

      while (this.#records.length > 0 && this.time.current - record.time > spm_count_duration)
        record = this.#records.shift()!;

      this.result.value = (currentRotation - record.rotation) / (this.time.current - record.time) * 1000 * 60 / 360;
    }

    this.#records.push(this.#lastRecord = { rotation: currentRotation, time: this.time.current });
  }

  #resetState()
  {
    this.#lastRecord = { time: 0,rotation: 0 };
    this.result.value = 0;
    this.#records.length = 0;
  }

  override dispose(isDisposing: boolean = true)
  {
    super.dispose(isDisposing);

    this.drawableSpinner.hitObjectApplied.removeListener(this.#resetState);
  }
}


export interface RotationRecord
{
  rotation: number;
  time: number;
}
