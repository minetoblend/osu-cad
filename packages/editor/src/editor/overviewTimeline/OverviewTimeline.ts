import {
  Axes,
  Box,
  Container,
  dependencyLoader,
  MouseDownEvent,
  resolved,
} from 'osucad-framework';
import { ThemeColors } from '../ThemeColors';
import { OverviewTimelineProgressBar } from './OverviewTimelineProgressBar';

export class OverviewTimeline extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  @resolved(ThemeColors)
  theme!: ThemeColors;

  @dependencyLoader()
  init() {
    this.addInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: this.theme.translucent,
        alpha: 0.5,
      }),
    );
    this.addInternal(this.#content);

    this.add(new OverviewTimelineProgressBar());
  }

  get content() {
    return this.#content;
  }

  #content = new Container({
    relativeSizeAxes: Axes.Both,
    padding: { horizontal: 30 },
  });

  onMouseDown(): boolean {
    return true;
  }
}
