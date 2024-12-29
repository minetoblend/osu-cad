import type { Bindable, Drawable } from 'osucad-framework';
import { Anchor, Axes, DrawableSprite } from 'osucad-framework';
import { ToolbarToggleButton } from '../../../../editor/screens/compose/ToolbarToggleButton';
import { OsucadColors } from '../../../../OsucadColors';
import { getIcon } from '../../../../OsucadIcons';

export class GridSnapToggleButton extends ToolbarToggleButton {
  constructor(bindable: Bindable<boolean>) {
    super();

    this.active.bindTo(bindable);
  }

  #icon!: DrawableSprite;

  protected override createContent(): Drawable {
    return this.#icon = new DrawableSprite({
      texture: getIcon('grid@2x'),
      relativeSizeAxes: Axes.Both,
      size: 0.65,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      color: OsucadColors.text,
    });
  }

  protected override updateState() {
    super.updateState();

    if (this.active.value) {
      this.#icon.color = this.isHovered ? OsucadColors.primaryHighlight : OsucadColors.primary;
    }
    else {
      this.#icon.color = this.isHovered ? 0xFFFFFF : OsucadColors.text;
    }
  }
}
