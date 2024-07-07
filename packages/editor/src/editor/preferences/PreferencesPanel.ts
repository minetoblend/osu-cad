import {
  Axes,
  Container,
  dependencyLoader,
  Drawable,
  FillDirection,
  FillFlowContainer,
  resolved,
  SpriteText,
  Vec2,
} from 'osucad-framework';
import { UIFonts } from '../UIFonts';

export abstract class PreferencesPanel extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
    });
    this.addInternal(this.#content);
  }

  #content = new FillFlowContainer({
    direction: FillDirection.Vertical,
    relativeSizeAxes: Axes.X,
    autoSizeAxes: Axes.Y,
    spacing: new Vec2(4),
    padding: { horizontal: 8, vertical: 8 },
  });

  get content() {
    return this.#content;
  }

  @resolved(UIFonts)
  fonts!: UIFonts;

  @dependencyLoader()
  load() {
    this.addAll(
      new SpriteText({
        text: this.getTitle(),
        style: {
          fontSize: 20,
          fill: 'white',
        },
        font: this.fonts.nunitoSans,
      }),
      ...this.createContent(),
    );
  }

  abstract getTitle(): string;

  abstract createContent(): Drawable[];
}
