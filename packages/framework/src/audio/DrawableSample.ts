import { CompositeDrawable } from "../graphics/containers/CompositeDrawable";
import type { Sample } from "./Sample";
import { BindableNumber } from "../bindables/BindableNumber";

export class DrawableSample extends CompositeDrawable
{
  public constructor(
    public readonly sample: Sample,
    public readonly disposeSampleOnDisposal = true,
  )
  {
    super();

    sample.volume.bindTo(this.volume);
    sample.rate.bindTo(this.rate);
  }

  public play()
  {
    this.getChannel().play();
  }

  public getChannel()
  {
    return this.sample.getChannel();
  }

  public override dispose()
  {
    if (this.disposeSampleOnDisposal)
      this.sample.dispose();

    super.dispose();
  }

  public readonly volume = new BindableNumber(1)
    .withMinValue(0)
    .withMaxValue(1);

  public readonly rate = new BindableNumber(1);
}
