import { Anchor, Axes, Bindable, CompositeDrawable, dependencyLoader, resolved } from 'osucad-framework';
import { OsucadSpriteText } from '../../OsucadSpriteText';
import { ThemeColors } from '../ThemeColors';
import { Toggle, ToggleTrigger } from '../../userInterface/Toggle.ts';

export class PreferencesToggle extends CompositeDrawable {
  constructor(
    readonly title: string,
    readonly bindable: Bindable<boolean>,
  ) {
    super();
    this.relativeSizeAxes = Axes.X;
    this.height = 24;
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      new OsucadSpriteText({
        text: this.title,
        color: this.colors.text,
        fontSize: 14,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }),
      new Toggle({ bindable: this.bindable, trigger: ToggleTrigger.MouseDown }).with({
        anchor: Anchor.CenterRight,
        origin: Anchor.CenterRight,
        scale: 0.65,
      }),
    );
  }
}
