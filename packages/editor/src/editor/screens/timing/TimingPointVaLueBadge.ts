import {
  Anchor,
  Axes,
  CompositeDrawable,
  Container,
  FillFlowContainer,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import type { ColorSource } from 'pixi.js';
import { OsucadSpriteText } from '../../../OsucadSpriteText';
import { FastRoundedBox } from '../../../drawables/FastRoundedBox';
import { ThemeColors } from '../../ThemeColors';

export class TimingPointValueBadge extends CompositeDrawable {
  constructor(
    readonly title: string,
    readonly value: string,
    readonly valueColor: ColorSource,
  ) {
    super();

    this.autoSizeAxes = Axes.Both;
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
        child: new FillFlowContainer({
          autoSizeAxes: Axes.Both,
          spacing: { x: 4, y: 0 },
          children: [
            new OsucadSpriteText({
              fontSize: 10,
              fontWeight: 600,
              text: this.title,
              color: this.colors.text,
              anchor: Anchor.CenterLeft,
              origin: Anchor.CenterLeft,
            }),
            this.#text = new OsucadSpriteText({
              fontSize: 11,
              fontWeight: 600,
              text: this.value,
              color: this.valueColor,
              anchor: Anchor.CenterLeft,
              origin: Anchor.CenterLeft,
            }),
          ],
        }),
      }),
    );
  }
}
