import type { Drawable } from '@osucad/framework';
import { Anchor, Axes, CompositeDrawable, Container, Dimension, GridContainer, GridSizeMode } from '@osucad/framework';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';

export interface LabelledDrawableOptions {
  label: string;
}

export abstract class LabelledDrawable<T extends Drawable> extends CompositeDrawable {
  protected constructor(options: LabelledDrawableOptions) {
    super();

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;

    this.addInternal(
      new GridContainer({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        rowDimensions: [
          new Dimension(GridSizeMode.AutoSize),
        ],
        columnDimensions: [
          new Dimension(GridSizeMode.Absolute, 100),
          new Dimension(),
        ],
        content: [[
          this.#label = new OsucadSpriteText({
            text: options.label,
            fontSize: 14,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
            alpha: 0.5,
          }),
          new Container({
            relativeSizeAxes: Axes.X,
            autoSizeAxes: Axes.Y,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
            child: this.component = this.createComponent(),
          }),
        ]],
      }),
    );
  }

  readonly #label: OsucadSpriteText;

  protected abstract createComponent(): T;

  protected component: T;
}
