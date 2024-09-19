import type { DrawableOptions, Vec2 } from 'osucad-framework';
import type { Color, ColorSource } from 'pixi.js';
import { Axes, CompositeDrawable, dependencyLoader, resolved } from 'osucad-framework';
import { RoundedRectangle } from 'pixi.js';
import { ThemeColors } from '../ThemeColors';
import { TimelineObjectLayer } from './TimelineObjectLayer';

export interface TimelineObjectBodyOptions extends DrawableOptions {
  outlineColor?: ColorSource;
  bodyColor?: ColorSource;
}

export class TimelineElement extends CompositeDrawable {
  constructor(options: TimelineObjectBodyOptions = {}) {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(
      this.body = new TimelineObjectLayer('body', {
        relativeSizeAxes: Axes.Both,
      }),
      this.overlay = new TimelineObjectLayer('body', {
        relativeSizeAxes: Axes.Both,
        alpha: 0,
      }),
      this.outline = new TimelineObjectLayer('outline', {
        relativeSizeAxes: Axes.Both,
      }),

    );

    this.with(options);
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.#selectionColor = this.theme.selection;
  }

  @resolved(ThemeColors)
  protected theme!: ThemeColors;

  readonly body!: TimelineObjectLayer;

  readonly outline!: TimelineObjectLayer;

  readonly overlay!: TimelineObjectLayer;

  get bodyColor(): Color {
    return this.body.color;
  }

  set bodyColor(value: ColorSource) {
    this.body.color = value;
  }

  #selected = false;

  #selectionColor: ColorSource = 0xFFFFFF;

  get selectionColor() {
    return this.#selectionColor;
  }

  set selectionColor(value: ColorSource) {
    this.#selectionColor = value;

    if (this.#selected)
      this.outline.color = value;
  }

  get selected() {
    return this.#selected;
  }

  set selected(value: boolean) {
    if (this.#selected === value)
      return;

    this.#selected = value;

    this.outline.color = value ? this.#selectionColor : 0xFFFFFF;
  }

  get overlayVisible() {
    return this.#overlayVisible;
  }

  set overlayVisible(value) {
    if (this.#overlayVisible === value)
      return;

    this.#overlayVisible = value;

    this.overlay.alpha = value ? 1 : 0;
  }

  #overlayVisible = false;

  #hitArea = new RoundedRectangle();

  updateDrawNodeTransform() {
    super.updateDrawNodeTransform();

    this.#hitArea.width = this.drawSize.x;
    this.#hitArea.height = this.drawSize.y;
    this.#hitArea.radius = this.drawSize.y * 0.5;
  }

  contains(screenSpacePosition: Vec2): boolean {
    const pos = this.toLocalSpace(screenSpacePosition);

    return this.#hitArea.contains(pos.x, pos.y);
  }
}
