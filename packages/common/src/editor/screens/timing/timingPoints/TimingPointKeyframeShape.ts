import type { PIXIGraphics } from 'osucad-framework';
import { Axes, GraphicsDrawable } from 'osucad-framework';

export class TimingPointKeyframeShape extends GraphicsDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  override updateGraphics(g: PIXIGraphics): void {
    const { x: width, y: height } = this.drawSize;

    const center = width * 0.5;
    const stemWidth = 2;
    const baseHeight = 2;

    g.clear()
      .poly([
        {
          x: 0,
          y: 0,
        },
        {
          x: width,
          y: 0,
        },
        {
          x: width,
          y: baseHeight,
        },
        {
          x: center + stemWidth * 0.5,
          y: baseHeight + 1,
        },
        {
          x: center + stemWidth * 0.5,
          y: height - baseHeight - 1,
        },
        {
          x: width,
          y: height - baseHeight,
        },
        {
          x: width,
          y: height,
        },
        {
          x: 0,
          y: height,
        },
        {
          x: 0,
          y: height - baseHeight,
        },
        {
          x: center - stemWidth * 0.5,
          y: height - baseHeight - 1,
        },
        {
          x: center - stemWidth * 0.5,
          y: baseHeight + 1,
        },
        {
          x: 0,
          y: baseHeight,
        },
      ], true)
      .fill({ color: 0xFFFFFF });
  }
}
