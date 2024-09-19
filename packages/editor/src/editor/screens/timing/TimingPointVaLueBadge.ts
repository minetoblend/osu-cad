import type { ColorSource } from 'pixi.js';
import {
  Anchor,
  Axes,
  CompositeDrawable,
  Container,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { FastRoundedBox } from '../../../drawables/FastRoundedBox';
import { OsucadSpriteText } from '../../../OsucadSpriteText';
import { ThemeColors } from '../../ThemeColors';

export class TimingPointValueBadge extends CompositeDrawable {
  constructor(
    readonly value: string,
    valueColor: ColorSource,
  ) {
    super();

    this.autoSizeAxes = Axes.Both;
    this.anchor = Anchor.CenterLeft;
    this.origin = Anchor.CenterLeft;

    this.#textColor = valueColor;
  }

  #textColor: ColorSource;

  get textColor() {
    return this.#textColor;
  }

  set textColor(value) {
    this.#textColor = value;
    this.#text.color = value;
  }

  #text!: OsucadSpriteText;

  get text() {
    return this.#text.text;
  }

  set text(value) {
    this.#text.text = value;
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0x343440,
        cornerRadius: 4,
      }),
      new Container({
        padding: { horizontal: 4, vertical: 1 },
        autoSizeAxes: Axes.Both,
        child: this.#text = new OsucadSpriteText({
          fontSize: 11,
          fontWeight: 600,
          text: this.value,
          color: this.textColor,
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
        }),
      }),
    );
  }
}
