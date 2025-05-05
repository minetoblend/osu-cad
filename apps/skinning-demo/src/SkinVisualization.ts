import type { Beatmap } from "@osucad/core";
import { PlayfieldClock } from "@osucad/core";
import type { ReadonlyDependencyContainer, StopwatchClock } from "@osucad/framework";
import { Axes, CompositeDrawable, FramedClock, provide } from "@osucad/framework";

export class SkinVisualization extends CompositeDrawable
{
  constructor(readonly beatmap: Beatmap)
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.gameplayClock.seek(this.startTime);

    void this.loadRuleset();
  }

  @provide(PlayfieldClock)
  protected readonly gameplayClock = new LoopingClock();

  get startTime()
  {
    return this.beatmap.hitObjects[0].startTime - 1000;
  }

  get beatmapDuration()
  {
    return this.beatmap.hitObjects[this.beatmap.hitObjects.length - 1].startTime + 1000;
  }

  public override update()
  {
    super.update();

    this.gameplayClock.processFrame();

    if (this.gameplayClock.currentTime > this.beatmapDuration)
      this.gameplayClock.seek(this.startTime);
  }

  async loadRuleset()
  {
    const drawableRuleset = await this.beatmap.beatmapInfo.ruleset?.createDrawableRuleset();
    if (drawableRuleset)
    {
      this.addInternal(drawableRuleset);

      for (const hitObject of this.beatmap.hitObjects)
      {
        drawableRuleset.addHitObject(hitObject);
      }

      console.log(drawableRuleset);
    }
  }
}

class LoopingClock extends FramedClock
{
  public seek(value: number)
  {
    (this.source as StopwatchClock).seek(value);
    super.currentTime = this.lastFrameTime = value;
  }
}
