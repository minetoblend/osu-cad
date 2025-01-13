import type { Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import { Axes, EmptyDrawable, MarginPadding, resolved, RoundedBox } from 'osucad-framework';
import { OsucadSpriteText } from '../../../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../../../OsucadColors';
import { TextBox } from '../../../../../userInterface/TextBox';
import { OperatorBox } from '../OperatorBox';

export class OperatorPropertyTextBox extends TextBox {
  constructor() {
    super();

    this.height = 20;
  }

  @resolved(OperatorBox, true)
  operatorBox!: OperatorBox;

  noBackground: boolean = false;

  protected override createBackground(): Drawable {
    return this.noBackground
      ? new EmptyDrawable()
      : this.#background = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        color: OsucadColors.text,
        fillAlpha: 0.2,
        cornerRadius: 4,
        outline: {
          width: 1,
          color: 0x000000,
          alpha: 0.1,
        },
      });
  }

  #background?: RoundedBox;

  protected override get textContainerPadding(): MarginPadding {
    return new MarginPadding({ horizontal: 8, vertical: 4 });
  }

  protected override createText(): OsucadSpriteText {
    return new OsucadSpriteText({
      color: OsucadColors.text,
      fontSize: 12,
    });
  }

  protected override createPlaceholder(): OsucadSpriteText {
    return new OsucadSpriteText({
      text: this.placeholderText,
      color: OsucadColors.text,
      fontSize: 12,
      alpha: 0.5,
    });
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    if (this.operatorBox)
      this.tabbableContentContainer = this.operatorBox;
  }

  override onFocus(): boolean {
    if (!super.onFocus())
      return false;

    this.selectAll();

    if (this.#background) {
      this.#background.outline = {
        width: 2,
        color: OsucadColors.primary,
        alpha: 0.75,
      };
    }

    return true;
  }

  override onFocusLost() {
    super.onFocusLost();

    if (this.#background) {
      this.#background.outline = {
        width: 1,
        color: 0x000000,
        alpha: 0.1,
      };
    }
  }
}
