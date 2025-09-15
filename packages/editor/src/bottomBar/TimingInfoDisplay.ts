import { Bindable } from "@osucad/framework";
import { Axes, CompositeDrawable, dependencyLoader, FillDirection, FillFlowContainer, resolved, SpriteText } from "@osucad/framework";
import { IBeatSyncProvider } from "../IBeatSyncProvider";
import { TimestampFormatter } from "../utils";
import type { TimingControlPoint } from "@osucad/core";

export class TimingInfoDisplay extends CompositeDrawable
{
  @resolved(IBeatSyncProvider)
  accessor #beatSyncProvider!: IBeatSyncProvider

  #currentTime = 0;

  #timestampText!: SpriteText;
  #bpmText!: SpriteText;

  private activeControlPoint!: Bindable<TimingControlPoint>;

  private activeBeatLength = new Bindable(0);

  @dependencyLoader()
  #load()
  {
    this.autoSizeAxes = Axes.Both;
    this.padding = { horizontal: 20 };

    this.activeControlPoint = this.#beatSyncProvider.activeTimingPoint.getBoundCopy();

    this.internalChild = new FillFlowContainer({
      autoSizeAxes: Axes.Both,
      direction: FillDirection.Vertical,
      children: [
        this.#timestampText = new SpriteText({
          text: "00:00:000",
          style: {
            fill: 0xffffff,
          },
        }),
        this.#bpmText = new SpriteText({
          text: "0bpm",
          style: {
            fill: 0xffffff,
            fontSize: 16,
          },
        }),
      ],
    });
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.activeControlPoint.bindValueChanged(e =>
    {
      if (e.previousValue)
        this.activeBeatLength.unbindFrom(e.value.beatLengthBindable);

      if (e.value)
        this.activeBeatLength.bindTo(e.value.beatLengthBindable);
    }, true);

    this.activeBeatLength.bindValueChanged(e =>
    {
      const bpm = 60_000 / e.value;

      const bpmString = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 1,
      }).format(bpm);

      this.#bpmText.text = `${bpmString}bpm`;
    }, true);
  }

  protected override update()
  {
    super.update();

    if (this.#currentTime !== this.#beatSyncProvider.currentTime)
    {
      this.#currentTime = this.#beatSyncProvider.currentTime;

      this.#timestampText.text = TimestampFormatter.format(this.#beatSyncProvider.currentTime);
    }
  }
}
