import type { ClickEvent, MouseDownEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import { Axes, Box, Container, Direction, FillDirection, FillFlowContainer } from 'osucad-framework';
import { BackdropBlurFilter } from 'pixi-filters';
import { OsucadScrollContainer } from '../../drawables/OsucadScrollContainer';
import { OsucadColors } from '../../OsucadColors';
import { AudioPreferencesSection } from './AudioPreferencesSection';
import { MainMenuPreferencesSection } from './MainMenuPreferencesSection';
import { SkinSection } from './SkinSection';
import { ViewportPreferencesSection } from './ViewportPreferencesSection';

export class Preferences extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
      relativePositionAxes: Axes.X,
    });
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const filter = new BackdropBlurFilter({
      strength: 24,
      quality: 4,
    });
    filter.padding = 20;

    this.addAllInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: OsucadColors.translucent,
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

    this.#content.scrollContent.padding = { right: 10 };

    this.createContent();
  }

  protected createContent() {
    this.addAll(
      new AudioPreferencesSection(),
      new SkinSection(),
      new ViewportPreferencesSection(),
      new MainMenuPreferencesSection(),
    );
  }

  override onClick(e: ClickEvent): boolean {
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

  #content = new OsucadScrollContainer(Direction.Vertical).with({
    relativeSizeAxes: Axes.Both,
    child: this.#items,
  });

  override get content() {
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

  override onMouseDown(e: MouseDownEvent): boolean {
    return true;
  }
}
