import { Anchor, Axes, CompositeDrawable, dependencyLoader } from 'osucad-framework';
import { OsucadButton } from '../../../userInterface/OsucadButton';

export class BackgroundSelectButton extends CompositeDrawable {
  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.Both;
    this.relativePositionAxes = Axes.X;
    this.anchor = Anchor.TopRight;
    this.origin = Anchor.TopRight;
    this.width = 0.5;

    this.padding = 30;

    this.addInternal(
      new OsucadButton().adjust((it) => {
        it.text = 'Change Background';
        it.backgroundAlpha = 0.8;
        it.autoSizeAxes = Axes.Y;
        it.relativeSizeAxes = Axes.X;
      }, true),
    );
  }
}
