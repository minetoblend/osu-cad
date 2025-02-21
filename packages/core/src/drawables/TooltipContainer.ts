import type { ContainerOptions, Drawable, InputManager } from '@osucad/framework';
import { OsucadColors, OsucadSpriteText } from '@osucad/core';
import { Anchor, Axes, Container, FastRoundedBox, provide, VisibilityContainer } from '@osucad/framework';

export interface IHasTooltip {
  readonly tooltipText: string | null;
}

export function hasTooltip(object: any): object is { tooltipText: string } {
  return !!object && 'tooltipText' in object && typeof object.tooltipText === 'string' && object.tooltipText.length > 0;
}

@provide(TooltipContainer)
export class TooltipContainer extends Container {
  constructor(options: ContainerOptions = {}) {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.internalChildren = [
      this.#content = new Container({
        relativeSizeAxes: Axes.Both,
      }),
      this.#tooltip = new DrawableTooltip(),
    ];

    this.with(options);
  }

  override get content(): Container<Drawable> {
    return this.#content;
  }

  readonly #content: Container;

  readonly #tooltip: DrawableTooltip;

  #inputManager!: InputManager;

  protected override loadComplete() {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;
  }

  override updateAfterChildren() {
    super.updateAfterChildren();

    let tooltipVisible = false;

    for (const drawable of this.#inputManager.hoveredDrawables) {
      if (hasTooltip(drawable)) {
        this.#tooltip.tooltipText = drawable.tooltipText;
        this.#tooltip.show();
        tooltipVisible = true;
        break;
      }
    }

    if (!tooltipVisible)
      this.#tooltip.hide();
  }
}

class DrawableTooltip extends VisibilityContainer {
  readonly #spriteText: OsucadSpriteText;

  constructor() {
    super();

    this.hide();

    this.autoSizeAxes = Axes.Both;
    this.origin = Anchor.Center;

    this.internalChildren = [
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 4,
        color: OsucadColors.translucent,
        alpha: 0.8,
      }),
      new Container({
        autoSizeAxes: Axes.Both,
        padding: { horizontal: 8, vertical: 6 },
        child: this.#spriteText = new OsucadSpriteText({
          text: 'tooltip',
          fontSize: 12,
        }),
      }),
    ];
  }

  override popIn() {
    this.fadeIn(100);
    this.position = this.targetPosition;
  }

  override popOut() {
    this.fadeOut(100);
  }

  get tooltipText() {
    return this.#spriteText.text;
  }

  set tooltipText(value: string) {
    this.#spriteText.text = value;
  }

  #inputManager!: InputManager;

  protected override loadComplete() {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;
  }

  protected get targetPosition() {
    return this.parent!.toLocalSpace(this.#inputManager.currentState.mouse.position).addInPlace({ x: 0, y: -10 });
  }

  override update() {
    super.update();

    const targetPosition = this.targetPosition;
    this.position = targetPosition.lerp(this.position, Math.exp(-0.01 * this.time.elapsed));
  }
}
