import {
  Anchor,
  Axes,
  Box,
  Container,
  EasingFunction,
  dependencyLoader,
  resolved,
  KeyDownEvent, Key,
} from 'osucad-framework';
import { ThemeColors } from '../editor/ThemeColors';
import { TextBox } from '../userInterface/TextBox';
import type { BeatmapSelectFilter } from './BeatmapSelectFilter';
import { AlwaysFocusedTextBox } from './AlwaysFocusedTextBox.ts';

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
      this.#content = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        width: 0.35,
        padding: 10,
      }),
    );

    const textBox = new AlwaysFocusedTextBox();

    this.add(textBox);

    textBox.current = this.filter.searchTerm.getBoundCopy();

    this.scheduler.addDelayed(() => {
      console.log(this.getContainingFocusManager()!.changeFocus(textBox));
    }, 100);
  }

  #content!: Container;

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
