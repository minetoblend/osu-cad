import type { Texture } from 'pixi.js';
import { Axes, Container, FillDirection, FillFlowContainer, Vec2 } from '@osucad/framework';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../OsucadColors';

export abstract class PreferencesSection extends Container {
  protected constructor(
    readonly title: string,
    readonly icon: Texture,
  ) {
    super();

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;

    this.internalChild = new FillFlowContainer({
      direction: FillDirection.Vertical,
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      spacing: new Vec2(4),
      padding: { horizontal: 12, vertical: 8 },
      children: [
        new OsucadSpriteText({
          text: title,
          fontSize: 20,
          color: OsucadColors.text,
        }),
        this.#content = new FillFlowContainer({
          direction: FillDirection.Vertical,
          relativeSizeAxes: Axes.X,
          autoSizeAxes: Axes.Y,
          spacing: new Vec2(4),
        }),
      ],
    });
  }

  readonly #content: FillFlowContainer;

  override get content() {
    return this.#content;
  }
}
