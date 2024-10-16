import type {
  KeyDownEvent,
} from 'osucad-framework';
import type { BeatmapSelectFilter } from './BeatmapSelectFilter';
import {
  Anchor,
  Axes,
  BindableBoolean,
  Box,
  Container,
  dependencyLoader,
  EasingFunction,
  FillFlowContainer,
  Key,
  resolved,
  Vec2,
} from 'osucad-framework';

import { LoadingSpinner } from '../drawables/LoadingSpinner';
import { ThemeColors } from '../editor/ThemeColors';
import { BeatmapStore } from '../environment';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { AlwaysFocusedTextBox } from './AlwaysFocusedTextBox';

export class BeatmapSelectHeader extends Container {
  constructor(readonly filter: BeatmapSelectFilter) {
    super({
      relativeSizeAxes: Axes.X,
      height: 120,
    });
    this.alwaysPresent = true;
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: this.colors.translucent,
        alpha: 0.9,
      }),
      this.#diffcalcBadge = new FillFlowContainer({
        spacing: new Vec2(10),
        padding: 20,
        autoSizeAxes: Axes.Both,
        alpha: 0,
        children: [
          new LoadingSpinner({
            size: 20,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
          new OsucadSpriteText({
            text: 'Calculating star rating in background',
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
        ],
      }),
      this.#content = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        width: 0.35,
        padding: 10,
      }),
    );

    const textBox = new AlwaysFocusedTextBox();
    textBox.placeholderText = 'Search';

    this.add(textBox);

    textBox.current = this.filter.searchTerm.getBoundCopy();

    textBox.commitOnEnter = false;
    textBox.commitImmediately = true;
    textBox.clearOnEscape = true;

    this.diffCalcActive.addOnChangeListener((e) => {
      if (e.value) {
        this.#diffcalcBadge
          .moveToY(-20)
          .moveToY(0, 200, EasingFunction.OutExpo)
          .fadeInFromZero(200);
      }
      else {
        this.#diffcalcBadge
          .moveToY(-20, 200, EasingFunction.OutExpo)
          .fadeOut(200, EasingFunction.OutQuad);
      }
    });

    this.diffCalcActive.bindTo(this.beatmapStore.diffcalcActive);
  }

  @resolved(BeatmapStore)
  beatmapStore!: BeatmapStore;

  diffCalcActive = new BindableBoolean();

  #content!: Container;

  #diffcalcBadge!: Container;

  get content() {
    return this.#content;
  }

  onMouseDown(): boolean {
    return true;
  }

  show() {
    this.y = -this.height;
    this.moveToY(0, 500, EasingFunction.OutExpo);
    this.fadeIn(200);
  }

  hide() {
    this.fadeOut(300);
    this.moveToY(-this.height, 300, EasingFunction.OutExpo);
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.Escape) {
      this.filter.searchTerm.value = '';

      return true;
    }

    return false;
  }
}
