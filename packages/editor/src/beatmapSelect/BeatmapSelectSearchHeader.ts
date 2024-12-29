import { Axes, Box, Container, dependencyLoader, resolved } from 'osucad-framework';
import { BackdropBlurFilter } from 'pixi-filters';
import { ThemeColors } from '../editor/ThemeColors';

export class BeatmapSelectSearchHeader extends Container {
  constructor() {
    super();
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    return;
    const filter = new BackdropBlurFilter({
      quality: 3,
      strength: 15,
      antialias: 'on',
    });
    filter.padding = 30;

    this.addInternal(
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: {
          top: -20,
          right: -20,
        },
        child: new Box({
          relativeSizeAxes: Axes.Both,
          alpha: 0.8,
          color: this.colors.translucent,
          filters: [filter],

        }),
      }),
    );
  }
}
