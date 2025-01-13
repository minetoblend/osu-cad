import type { Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import { EmptyDrawable, MarginPadding, resolved } from 'osucad-framework';
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
    return this.noBackground ? new EmptyDrawable() : super.createBackground();
  }

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

    return true;
  }
}
