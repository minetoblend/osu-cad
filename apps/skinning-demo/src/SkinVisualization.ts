import type { Beatmap } from "@osucad/core";
import { PlayfieldClock } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Axes, CompositeDrawable, FramedClock, provide } from "@osucad/framework";
import { ReplayPlayer } from "./ReplayPlayer";
import { applyHiddenMod } from "./hidden";

export class SkinVisualization extends CompositeDrawable
{
  constructor(readonly beatmap: Beatmap)
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  protected override get hasAsyncLoader(): boolean
  {
    return true;
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void>
  {
    await super.loadAsync(dependencies);

    this.gameplayClock.changeSource(this.clock!);

    this.gameplayClock.seek(this.startTime);

    await this.loadRuleset();
  }

  @provide(PlayfieldClock)
  protected readonly gameplayClock = new LoopingClock(undefined, false);

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
      const replayPlayer = new ReplayPlayer(drawableRuleset, drawableRuleset.playfield);
      await this.loadComponentAsync(replayPlayer);

      applyHiddenMod(this.beatmap, drawableRuleset);

      this.addInternal(replayPlayer);

      for (const hitObject of this.beatmap.hitObjects)
        drawableRuleset.addHitObject(hitObject);

    }
  }
}

class LoopingClock extends FramedClock
{
  offset = 0;

  override get sourceTime(): number
  {
    return (super.sourceTime + this.offset) * this.rate;
  }

  override get rate()
  {
    return 1.5;
  }

  public seek(value: number)
  {
    this.offset = (super.sourceTime / this.rate) - value;
    super.currentTime = this.lastFrameTime = value;
  }
}
