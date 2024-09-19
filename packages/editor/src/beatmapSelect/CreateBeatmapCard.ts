import { Anchor, Axes, Container, dependencyLoader, FillDirection, FillFlowContainer, resolved, RoundedBox } from 'osucad-framework';
import { ThemeColors } from '../editor/ThemeColors';
import { OsucadSpriteText } from '../OsucadSpriteText';

export class CreateBeatmapCard extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
    });
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.addInternal(
      new RoundedBox({
        relativeSizeAxes: Axes.Both,
        fillAlpha: 0,
        cornerRadius: 10,
        color: this.colors.text,
        outlines: [{
          width: 1.5,
          color: 0xFFFFFF,
          alpha: 1,
        }],
      }),
    );

    let text: OsucadSpriteText;

    this.addInternal(this.#content = new Container({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      padding: { horizontal: 10, vertical: 20 },
      children: [
        new FillFlowContainer({
          direction: FillDirection.Vertical,
          spacing: { x: 0, y: 4 },
          relativeSizeAxes: Axes.X,
          autoSizeAxes: Axes.Y,
          children: [
            text = new OsucadSpriteText({
              text: 'Drop a .osz file here\nto import a beatmap',
              color: this.colors.text,
              anchor: Anchor.TopCenter,
              origin: Anchor.TopCenter,
            }),
          ],
        }),
      ],
    }));

    text.style.align = 'center';
  }

  get content() {
    return this.#content;
  }

  #content!: Container;
}
