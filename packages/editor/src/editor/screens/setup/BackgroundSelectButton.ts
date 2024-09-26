import {
  Anchor,
  Axes,
  CompositeDrawable,
  type DependencyContainer,
  dependencyLoader,
} from 'osucad-framework';
import { OsucadSpriteText } from '../../../OsucadSpriteText.ts';
import { ThemeColors } from '../../ThemeColors.ts';

export class BackgroundSelectButton extends CompositeDrawable {
  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    const colors = dependencies.resolve(ThemeColors);

    this.relativeSizeAxes = Axes.Both;
    this.anchor = Anchor.TopRight;
    this.origin = Anchor.TopRight;
    this.width = 0.4;

    this.addInternal(this.text = new OsucadSpriteText({
      text: 'Click to select background\n(Coming soon)',
      color: colors.text,
      fontSize: 28,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));

    this.text.style.align = 'center';
  }

  text!: OsucadSpriteText;
}
