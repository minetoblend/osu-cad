import type { Bindable, ClickEvent } from '@osucad/framework';
import { Anchor, Axes, BindableBoolean, CompositeDrawable } from '@osucad/framework';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';
import { Checkbox } from '../../userInterface/Checkbox';

export class SettingsCheckbox extends CompositeDrawable {
  constructor(label: string, bindable?: Bindable<boolean>) {
    super();

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;

    if (bindable)
      this.value.bindTo(bindable);

    this.internalChildren = [
      new OsucadSpriteText({
        text: label,
        fontSize: 14,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        alpha: 0.5,
      }),
      new Checkbox({
        anchor: Anchor.CenterRight,
        origin: Anchor.CenterRight,
        current: this.value,
      }),
    ];
  }

  value = new BindableBoolean();

  override onClick(e: ClickEvent): boolean {
    this.value.toggle();
    return true;
  }
}
