import { CompositeDrawable } from "../graphics/containers/CompositeDrawable";
import type { Sample } from "./Sample";
import { BindableNumber } from "../bindables/BindableNumber";

export class DrawableSample extends CompositeDrawable
{
  constructor(readonly sample: Sample, readonly disposeSampleOnDisposal = true)
  {
    super();

    sample.volume.bindTo(this.volume);
    sample.rate.bindTo(this.rate);
  }

  play()
  {
    this.getChannel().play();
  }

  getChannel()
  {
    return this.sample.getChannel();
  }

  override dispose(isDisposing: boolean = true)
  {
    if (this.disposeSampleOnDisposal)
      this.sample.dispose();

    super.dispose(isDisposing);
  }

  readonly volume = new BindableNumber(1)
    .withMinValue(0)
    .withMaxValue(1);

  readonly rate = new BindableNumber(1);
}
