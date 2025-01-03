import type { Container, Drawable } from 'osucad-framework';
import type { BeatmapCheck } from '../../../verifier/BeatmapCheck';
import { Axes, FillDirection, FillFlowContainer, Vec2 } from 'osucad-framework';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../OsucadColors';

export class DrawableIssueGroup extends FillFlowContainer {
  constructor(readonly check: BeatmapCheck<any>) {
    super();

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;
    this.direction = FillDirection.Vertical;
    this.spacing = new Vec2(5);
    this.margin = { bottom: 15 };

    this.internalChildren = [
      new OsucadSpriteText({
        text: check.metadata.message,
        color: OsucadColors.text,
        fontSize: 18,
      }),
      this.#content = new FillFlowContainer({
        direction: FillDirection.Vertical,
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        spacing: new Vec2(5),
        padding: { left: 15 },
      }),
    ];
  }

  readonly #content: Container;

  override get content(): Container<Drawable> {
    return this.#content;
  }
}
