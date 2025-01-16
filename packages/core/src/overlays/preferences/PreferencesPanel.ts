import type { Drawable, ReadonlyDependencyContainer } from '@osucad/framework';
import { Axes, Container, FillDirection, FillFlowContainer, Vec2 } from '@osucad/framework';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';

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

  override get content() {
    return this.#content;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

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
