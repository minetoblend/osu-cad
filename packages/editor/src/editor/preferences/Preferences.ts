import {
  Axes,
  Box,
  Container,
  Direction,
  FillDirection,
  FillFlowContainer,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { BackdropBlurFilter } from 'pixi-filters';
import { ThemeColors } from '../ThemeColors';
import { MainScrollContainer } from '../MainScrollContainer';
import { AudioPreferencesSection } from './AudioPreferencesSection';
import { MainMenuPreferencesSection } from './MainMenuPreferencesSection.ts';
import { ViewportPreferencesSection } from './ViewportPreferencesSection';

export class Preferences extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
      relativePositionAxes: Axes.X,
    });
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    const filter = new BackdropBlurFilter({
      strength: 24,
      quality: 3,
    });
    filter.padding = 20;

    this.addAllInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: this.colors.translucent,
        alpha: 0.8,
        filters: [filter],
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { left: 48 },
        child: this.#content,
      }),
      new Box({
        relativeSizeAxes: Axes.Y,
      }),
    );

    this.createContent();
  }

  protected createContent() {
    this.addAll(
      new AudioPreferencesSection(),
      new ViewportPreferencesSection(),
      new MainMenuPreferencesSection(),
    );
  }

  onClick(): boolean {
    return true;
  }

  #items = new FillFlowContainer({
    relativeSizeAxes: Axes.X,
    autoSizeAxes: Axes.Y,
    direction: FillDirection.Vertical,
  });

  #tabButtons = new FillFlowContainer({
    width: 48,
    autoSizeAxes: Axes.Y,
  });

  #content = new MainScrollContainer(Direction.Vertical).with({
    relativeSizeAxes: Axes.Both,
    child: this.#items,
  });

  get content() {
    return this.#items;
  }

  override show() {
    this.fadeIn(400);
    const scrollTarget = this.#content.current;
    this.#content.scrollBy(-1000, false);
    this.#content.scrollTo(scrollTarget);
  }

  override hide() {
    this.fadeOut(400);
  }
}
