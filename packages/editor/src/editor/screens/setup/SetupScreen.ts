import type {
  DependencyContainer,
} from 'osucad-framework';
import type { EditorBackground } from '../../EditorBackground.ts';
import {
  Anchor,
  Axes,
  Box,
  Container,
  dependencyLoader,
  Direction,
  EasingFunction,
} from 'osucad-framework';
import { OsucadSpriteText } from '../../../OsucadSpriteText.ts';
import { MainScrollContainer } from '../../MainScrollContainer.ts';
import { ThemeColors } from '../../ThemeColors.ts';
import { EditorScreen } from '../EditorScreen';

export class SetupScreen extends EditorScreen {
  constructor() {
    super();
  }

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    const colors = dependencies.resolve(ThemeColors);

    let text: OsucadSpriteText;

    this.addInternal(this.backgroundTextContainer = new Container({
      relativeSizeAxes: Axes.Both,
      width: 0.4,
      anchor: Anchor.TopRight,
      origin: Anchor.TopRight,
      child: text = new OsucadSpriteText({
        text: 'Click to select background\n(Coming soon)',
        color: colors.text,
        fontSize: 28,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    }));

    text.style.align = 'center';

    this.backgroundTextContainer
      .moveToY(200)
      .moveToY(0, 500, EasingFunction.OutExpo);

    this.addInternal(this.#content = new Container({
      relativeSizeAxes: Axes.Both,
      relativePositionAxes: Axes.X,
      width: 0.6,
      height: 1.1,
      x: -0.6,
      children: [
        new Box({
          relativeSizeAxes: Axes.Both,
          color: 0x151517,
        }),
        new MainScrollContainer(Direction.Vertical).with({
          relativeSizeAxes: Axes.Both,
          children: [
            new Container({
              height: 2000,
            }),
          ],
        }),
      ],
    }));

    this.#content.moveToX(0, 500, EasingFunction.OutExpo);
  }

  #content!: Container;

  backgroundTextContainer!: Container;

  adjustBackground(background: EditorBackground) {
    background.fadeTo(0.5, 500, EasingFunction.OutQuad);
    background.scaleTo(1.2, 500, EasingFunction.OutExpo);

    background.resizeWidthTo(0.35, 500, EasingFunction.OutExpo);
    background.moveToX(0.3, 500, EasingFunction.OutExpo);
  }

  protected override get fadeInDuration() {
    return 0;
  }

  hide() {
    this.fadeTo(1, 500);

    this.#content.moveToX(-0.6, 500, EasingFunction.OutExpo);

    this.backgroundTextContainer
      .moveToY(100, 500, EasingFunction.OutExpo)
      .fadeOut(300);

    this.editor.applyToBackground((background) => {
      background.moveToX(0, 500, EasingFunction.OutExpo);
      background.resizeWidthTo(1, 500, EasingFunction.OutExpo);
    });
  }
}
