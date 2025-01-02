import type { Bindable, ReadonlyDependencyContainer } from 'osucad-framework';
import { Anchor, Axes, CompositeDrawable } from 'osucad-framework';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../OsucadColors';
import { Toggle, ToggleTrigger } from '../../userInterface/Toggle';

export class PreferencesToggle extends CompositeDrawable {
  constructor(
    readonly title: string,
    readonly bindable: Bindable<boolean>,
  ) {
    super();
    this.relativeSizeAxes = Axes.X;
    this.height = 24;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addAllInternal(
      new OsucadSpriteText({
        text: this.title,
        color: OsucadColors.text,
        fontSize: 14,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }),
      new Toggle({ bindable: this.bindable, trigger: ToggleTrigger.MouseDown }).with({
        anchor: Anchor.CenterRight,
        origin: Anchor.CenterRight,
        scale: 0.85,
      }),
    );
  }
}
