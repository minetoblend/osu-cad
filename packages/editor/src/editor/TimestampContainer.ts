import type {
  SpriteText,
} from 'osucad-framework';
import { ControlPointInfo } from '@osucad/common';
import {
  Anchor,
  Axes,
  Container,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { EditorClock } from './EditorClock';
import { ThemeColors } from './ThemeColors';
import { Timestamp } from './Timestamp';

export class TimestampContainer extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  timestamp = new Timestamp();

  bpm!: SpriteText;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  @resolved(ControlPointInfo)
  controlPoints!: ControlPointInfo;

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.add(this.timestamp);
    this.add(
      (this.bpm = new OsucadSpriteText({
        text: '180bpm',
        color: this.colors.primary,
        fontWeight: 600,
        fontSize: 12,
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
      })),
    );
  }

  update(): void {
    super.update();

    const timingPoint = this.controlPoints.timingPointAt(this.editorClock.currentTime);

    let bpm = 60_000 / timingPoint.beatLength;
    bpm = Math.round(bpm * 10) / 10;
    this.bpm.text = `${bpm}bpm`;
  }
}
