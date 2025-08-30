import type { GameHost } from "@osucad/framework";
import { Anchor, Axes, Bindable, Container, FrameStatistics, GAME_HOST, lerp, resolved, SpriteText } from "@osucad/framework";

export class PerformanceOverlay extends Container
{
  public constructor()
  {
    super({
      relativeSizeAxes: Axes.Both,
    });

    this.padding = 20;

    this.add(this.fpsText);
  }

  public fpsText = new SpriteText({
    text: "",
    anchor: Anchor.BottomRight,
    origin: Anchor.BottomRight,
    style: {
      fill: 0xffffff,
    },
  });

  public lastFrame = 0;

  public fps = new Bindable(0);

  public fpsInterpolated = new Bindable(0);

  @resolved(() => GAME_HOST)
  accessor #host!: GameHost

  #frameTime = 0;

  protected override loadComplete()
  {
    super.loadComplete();

    this.#host.afterRender.addListener(() =>
    {
      this.fps.value = this.clock!.framesPerSecond;

      const frameTime = FrameStatistics.frame.total;

      this.#frameTime = lerp(frameTime, this.#frameTime, Math.exp(-0.01 * this.time.elapsed));

      this.fpsInterpolated.value = lerp(this.fps.value, this.fpsInterpolated.value, Math.exp(-0.01 * this.time.elapsed));

      this.fpsText.text = `${this.#frameTime.toFixed(1)}ms (${this.fpsInterpolated.value.toFixed(0)}fps)`;
    });

  }
}
