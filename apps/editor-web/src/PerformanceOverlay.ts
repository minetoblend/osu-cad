import type { GameHost } from "@osucad/framework";
import { Anchor, Axes, Bindable, Container, EasingFunction, FrameStatistics, GAME_HOST, resolved, SpriteText } from "@osucad/framework";

export class PerformanceOverlay extends Container
{
  constructor()
  {
    super({
      relativeSizeAxes: Axes.Both,
    });

    this.padding = 20;

    this.add(this.fpsText);
  }

  fpsText = new SpriteText({
    text: "",
    anchor: Anchor.BottomRight,
    origin: Anchor.BottomRight,
    style: {
      fill: 0xffffff,
    },
  });

  lastFrame = 0;

  fps = new Bindable(0);

  fpsInterpolated = new Bindable(0);

  @resolved(() => GAME_HOST)
  accessor #host!: GameHost

  protected override loadComplete()
  {
    super.loadComplete();

    this.fps.bindValueChanged((fps) =>
    {
      this.transformBindableTo(this.fpsInterpolated, fps.value, 300, EasingFunction.OutExpo);
    });

    this.#host.afterRender.addListener(() =>
    {
      this.fps.value = this.clock!.framesPerSecond;

      const frameTime = FrameStatistics.frame.total;

      this.fpsText.text = `${frameTime.toFixed(1)}ms (${this.fpsInterpolated.value.toFixed(0)}fps)`;
    });

  }
}
