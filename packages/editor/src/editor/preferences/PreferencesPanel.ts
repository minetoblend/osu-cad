import type {
  Drawable,
} from 'osucad-framework';
import {
  Axes,
  Container,
  FillDirection,
  FillFlowContainer,
  Vec2,
  dependencyLoader,
} from 'osucad-framework';
import { OsucadSpriteText } from '../../OsucadSpriteText';

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
    padding: { horizontal: 12, vertical: 8 },
  });

  get content() {
    return this.#content;
  }

  @dependencyLoader()
  load() {
    this.addAll(
      new OsucadSpriteText({
        text: this.getTitle(),
        fontSize: 20,
      }),
      ...this.createContent(),
    );
  }

  abstract getTitle(): string;

  abstract createContent(): Drawable[];
}
