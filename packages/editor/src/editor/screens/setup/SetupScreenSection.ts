import {
  Anchor,
  Axes,
  Container,
  dependencyLoader,
  FillDirection,
  FillFlowContainer,
  resolved,
  Vec2,
} from 'osucad-framework';
import { SizeLimitedContainer } from '../../../drawables/SizeLimitedContainer.ts';
import { OsucadSpriteText } from '../../../OsucadSpriteText.ts';
import { ThemeColors } from '../../ThemeColors.ts';

export abstract class SetupScreenSection extends Container {
  protected constructor(
    readonly title: string,
  ) {
    super();
    this.padding = 10;
    this.margin = { bottom: 5 };
  }

  #content!: Container;

  mainContent!: FillFlowContainer;

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  [Symbol('load')]() {
    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;

    this.addInternal(
      this.#content = new SizeLimitedContainer({
        anchor: Anchor.TopCenter,
        origin: Anchor.TopCenter,
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        maxWidth: 500,
        children: [
          new OsucadSpriteText({
            text: this.title,
            fontSize: 20,
            color: this.colors.text,
          }),
          this.mainContent = new FillFlowContainer({
            padding: { left: 12, top: 40 },
            relativeSizeAxes: Axes.X,
            autoSizeAxes: Axes.Y,
            direction: FillDirection.Vertical,
            spacing: new Vec2(8),
          }),
        ],
      }),
    );

    this.createContent(this.mainContent);
  }

  override get content() {
    return this.#content;
  }

  protected abstract createContent(container: FillFlowContainer): void;
}
