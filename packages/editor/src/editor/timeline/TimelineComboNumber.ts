import { Anchor, Axes, CompositeDrawable, FillMode, dependencyLoader } from 'osucad-framework';
import type { HitObject } from '@osucad/common';
import { OsucadSpriteText } from '../../OsucadSpriteText';

export class TimelineComboNumber extends CompositeDrawable {
  constructor(readonly hitObject: HitObject) {
    super();

    this.apply({
      relativeSizeAxes: Axes.Both,
      fillMode: FillMode.Fit,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    });
  }

  @dependencyLoader()
  load() {
    this.addInternal(
      this.comboNumberText = new OsucadSpriteText({
        text: (this.hitObject.indexInCombo + 1).toString(),
        anchor: Anchor.Center,
        origin: Anchor.Center,
        fontSize: 15,
        fontWeight: 500,
      }),
    );

    this.hitObject.onUpdate.addListener((type) => {
      if (type === 'combo') {
        this.comboNumberText.text = (this.hitObject.indexInCombo + 1).toString();
      }
    });
  }

  protected comboNumberText!: OsucadSpriteText;
}
