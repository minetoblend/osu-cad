import { Anchor, Axes, Bindable, Container, EasingFunction, SpriteText } from "@osucad/framework";

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

  protected override loadComplete()
  {
    super.loadComplete();

    this.fps.bindValueChanged((fps) =>
    {
      this.transformBindableTo(this.fpsInterpolated, fps.value, 300, EasingFunction.OutExpo);
    });
  }

  override update()
  {
    super.update();

    this.fps.value = this.clock!.framesPerSecond;

    this.fpsText.text = `${this.clock!.elapsedFrameTime.toFixed(1)}ms (${this.fpsInterpolated.value.toFixed(0)}fps)`;
  }
}
