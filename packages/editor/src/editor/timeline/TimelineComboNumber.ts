import { Anchor, Axes, CompositeDrawable, FillMode, dependencyLoader } from 'osucad-framework';
import { OsucadSpriteText } from '../../OsucadSpriteText';
import type { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';

export class TimelineComboNumber extends CompositeDrawable {
  constructor(readonly hitObject: OsuHitObject) {
    super();

    this.with({
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

    this.hitObject.changed.addListener((event) => {
      if (event.propertyName === 'combo') {
        this.comboNumberText.text = (this.hitObject.indexInCombo + 1).toString();
      }
    });
  }

  protected comboNumberText!: OsucadSpriteText;
}
