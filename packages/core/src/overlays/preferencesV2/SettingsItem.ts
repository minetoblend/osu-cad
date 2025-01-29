import type { Drawable } from '@osucad/framework';
import { Axes, Container, FillDirection, FillFlowContainer, Vec2 } from '@osucad/framework';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';

export class SettingsItem extends Container {
  constructor(label: string) {
    super({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
    });

    this.margin = { bottom: 4 };

    this.internalChild = new FillFlowContainer({
      direction: FillDirection.Vertical,
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      spacing: new Vec2(4),
      children: [
        new OsucadSpriteText({
          text: label,
          fontSize: 12,
          alpha: 0.5,
        }),
        this.#content = new Container({
          relativeSizeAxes: Axes.X,
          autoSizeAxes: Axes.Y,
        }),
      ],
    });
  }

  readonly #content: Container;

  override get content(): Container<Drawable> {
    return this.#content;
  }
}
