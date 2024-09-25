import { Anchor, Axes, CompositeDrawable, dependencyLoader, resolved } from 'osucad-framework';
import { OsucadSpriteText } from '../../../OsucadSpriteText';
import { ThemeColors } from '../../ThemeColors';
import { TimingPointRow } from './TimingPointRow';

export class TimingPointTableHeader extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.X;
    this.height = TimingPointRow.HEIGHT;
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.padding = { horizontal: 8 };

    this.addAllInternal(
      new OsucadSpriteText({
        text: 'Timing',
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        fontSize: 14,
        color: this.colors.text,
      }),
      new OsucadSpriteText({
        text: 'Hitsounds',
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        fontSize: 14,
        color: this.colors.text,
        x: TimingPointRow.COLUMNS.hitSounds.x,
      }),
      new OsucadSpriteText({
        text: 'SV',
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        fontSize: 14,
        color: this.colors.text,
        x: TimingPointRow.COLUMNS.sliderVelocity.x,
      }),
      new OsucadSpriteText({
        text: 'Effects',
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        fontSize: 14,
        color: this.colors.text,
        x: TimingPointRow.COLUMNS.effects.x,
      }),
    );
  }
}
