import type { Bindable } from 'osucad-framework';
import { Anchor, Axes, CompositeDrawable, RoundedBox, dependencyLoader, resolved } from 'osucad-framework';
import gsap from 'gsap';
import { OsucadSpriteText } from '../../OsucadSpriteText';
import { ThemeColors } from '../ThemeColors';

export class PreferencesToggle extends CompositeDrawable {
  constructor(
    readonly title: string,
    readonly bindable: Bindable<boolean>,
  ) {
    super();
    this.relativeSizeAxes = Axes.X;
    this.height = 20;
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
      this.#toggle = new RoundedBox({
        width: 18,
        height: 10,
        cornerRadius: 5,
        x: -2,
        anchor: Anchor.CenterRight,
        origin: Anchor.CenterRight,
        fillColor: this.colors.primary,
        outline: {
          width: 1.5,
          color: this.colors.text,
          alignment: 0,
          alpha: 0.5,
        },
      }),
    );

    this.bindable.addOnChangeListener((value) => {
      gsap.to(this.#toggle, {
        fillAlpha: value ? 1 : 0,
        duration: 0.2,
      });

      this.#toggle.outline = {
        width: 1.5,
        color: value ? this.colors.primary : this.colors.text,
        alignment: 0,
        alpha: 0.5,
      };
    });
  }

  #toggle!: RoundedBox;

  onClick(): boolean {
    this.bindable.value = !this.bindable.value;
    return true;
  }
}
