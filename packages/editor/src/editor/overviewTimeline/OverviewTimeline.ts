import {
  Axes,
  Box,
  Container,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { ThemeColors } from '../ThemeColors';
import { BookmarkMarkers } from './BookmarkMarkers';
import { DifficultyPointMarkers } from './DifficultyPointMarkers';
import { OverviewTimelineProgressBar } from './OverviewTimelineProgressBar';
import { SectionMarkers } from './SectionMarkers';
import { TimingPointMarkers } from './TimingPointMarkers';

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

    this.addAll(
      new BookmarkMarkers(),
      new TimingPointMarkers(),
      new DifficultyPointMarkers(),
      new OverviewTimelineProgressBar(),
      new SectionMarkers(),
    );
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
