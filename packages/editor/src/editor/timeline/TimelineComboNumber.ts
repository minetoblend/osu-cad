import type { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { Anchor, Axes, CompositeDrawable, dependencyLoader, FillMode } from 'osucad-framework';
import { OsucadSpriteText } from '../../OsucadSpriteText';

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

    this.hitObject.indexInComboBindable.valueChanged.addListener(this.comboNumberChanged, this);
  }

  comboNumberChanged() {
    this.comboNumberText.text = (this.hitObject.indexInCombo + 1).toString();
  }

  protected comboNumberText!: OsucadSpriteText;

  dispose(isDisposing: boolean = true) {
    this.hitObject.indexInComboBindable.valueChanged.removeListener(this.comboNumberChanged);

    super.dispose(isDisposing);
  }
}
