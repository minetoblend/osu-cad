import { Anchor, Axes, Container, SpriteText } from "@osucad/framework";

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

  override update()
  {
    super.update();

    const now = performance.now();

    const frameTime = now- this.lastFrame;

    this.lastFrame = now;

    const fps = 1000 / frameTime;

    this.fpsText.text = `${frameTime.toFixed(1)}ms (${fps.toFixed(0)}fps)`;
  }
}
