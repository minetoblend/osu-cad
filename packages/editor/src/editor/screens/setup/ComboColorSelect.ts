import {
  Anchor,
  Axes,
  CompositeDrawable,
  dependencyLoader,
  DrawableSprite,
  FillDirection,
  FillFlowContainer,
  resolved,
  RoundedBox,
  Vec2,
} from 'osucad-framework';
import { Beatmap } from '../../../beatmap/Beatmap.ts';
import { FastRoundedBox } from '../../../drawables/FastRoundedBox.ts';
import { OsucadIcons } from '../../../OsucadIcons.ts';

export class ComboColorSelect extends FillFlowContainer {
  constructor() {
    super({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      spacing: new Vec2(8),
      direction: FillDirection.Full,
    });
  }

  @resolved(Beatmap)
  beatmap!: Beatmap;

  get colors() {
    return this.beatmap.colors;
  }

  @dependencyLoader()
  load() {
    for (const color of this.colors.comboColors)
      this.add(new ColorSwatch().with({ color }));

    this.add(new AddColorButton().with({ depth: -1 }));
  }
}

class ColorSwatch extends CompositeDrawable {
  @dependencyLoader()
  load() {
    this.size = new Vec2(40);

    this.addAllInternal(
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 6,
      }),
    );
  }
}

class AddColorButton extends CompositeDrawable {
  @dependencyLoader()
  load() {
    this.size = new Vec2(40);

    this.addAllInternal(
      new RoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 6,
        fillAlpha: 0.1,
        outlines: [{
          width: 1.5,
          color: 0xC0BFBD,
          alignment: 1,
        }],
      }),
      new DrawableSprite({
        texture: OsucadIcons.get('plus'),
        anchor: Anchor.Center,
        origin: Anchor.Center,
        relativeSizeAxes: Axes.Both,
        size: 0.3,
      }),
    );
  }
}
