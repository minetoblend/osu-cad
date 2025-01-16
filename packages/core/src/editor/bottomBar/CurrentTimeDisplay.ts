import type { ReadonlyDependencyContainer, SpriteText } from '@osucad/framework';
import { Anchor, Axes, CompositeDrawable, FillDirection, FillFlowContainer, resolved } from '@osucad/framework';
import { IBeatmap } from '../../beatmap/IBeatmap';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../OsucadColors';
import { EditorClock } from '../EditorClock';
import { TimestampFormatter } from '../TimestampFormatter';

export class CurrentTimeDisplay extends CompositeDrawable {
  @resolved(EditorClock)
  editorClock!: EditorClock;

  #timestampText!: SpriteText;

  #bpmText!: SpriteText;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Both;

    this.addInternal(
      new FillFlowContainer({
        autoSizeAxes: Axes.Both,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        direction: FillDirection.Vertical,
        children: [
          this.#timestampText = new OsucadSpriteText({
            text: '00:00:000',
            color: OsucadColors.text,
            fontSize: 18,
          }),
          this.#bpmText = new OsucadSpriteText({
            text: '180bpm',
            color: OsucadColors.primary,
            fontWeight: 600,
            fontSize: 12,
          }),
        ],
      }),
    );

    this.editorClock.currentTimeBindable.valueChanged.addListener(this.#updateTimestamp, this);
  }

  #updateTimestamp() {
    this.#timestampText.text = TimestampFormatter.formatTimestamp(this.editorClock.currentTime);
  }

  #bpm = 180;

  @resolved(IBeatmap)
  beatmap!: IBeatmap;

  override update() {
    super.update();

    const timingPoint = this.beatmap.controlPoints.timingPointAt(this.editorClock.currentTime);

    if (timingPoint.bpm !== this.#bpm) {
      this.#bpm = timingPoint.bpm;
      this.#bpmText.text = `${this.#bpm.toFixed(0)}bpm`;
    }
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.editorClock.currentTimeBindable.valueChanged.removeListener(this.#updateTimestamp, this);
  }
}
