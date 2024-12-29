import type { Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import { Anchor, Axes, Container, EmptyDrawable } from 'osucad-framework';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../OsucadColors';
import { EditorButton } from './EditorButton';

export class EditorTextButton extends EditorButton {
  constructor(readonly text: string) {
    super();
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    this.autoSizeAxes = Axes.X;
    this.scaleContainer.relativeSizeAxes = Axes.Y;
    this.scaleContainer.autoSizeAxes = Axes.X;

    super.load(dependencies);

    this.addInternal(
      new Container({
        autoSizeAxes: Axes.Both,
        padding: { horizontal: 10, vertical: 4 },
        anchor: Anchor.Center,
        origin: Anchor.Center,
        child: this.#text = new OsucadSpriteText({
          text: this.text,
          color: OsucadColors.text,
        }),
      }),
    );
  }

  #text!: OsucadSpriteText;

  protected override createContent(): Drawable {
    return new EmptyDrawable();
  }

  protected override updateState() {
    super.updateState();

    if (this.active.value)
      this.#text.color = OsucadColors.primary;
    else
      this.#text.color = OsucadColors.text;
  }
}
