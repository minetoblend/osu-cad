import type { ContainerOptions, Drawable, InputManager } from '@osucad/framework';
import { Axes, Box, clamp, Container, provide, VisibilityContainer } from '@osucad/framework';
import { OsucadColors } from '../OsucadColors';
import { OsucadSpriteText } from './OsucadSpriteText';

export interface IHasTooltip {
  readonly tooltipText: string | null;
}

export function hasTooltip(object: any): object is { tooltipText: string } {
  return !!object && 'tooltipText' in object && typeof object.tooltipText === 'string' && object.tooltipText.length > 0;
}

const hover_time = 650;

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

  #currentTarget?: Drawable;
  #targetHoverTime = 0;

  override updateAfterChildren() {
    super.updateAfterChildren();

    let foundTarget = false;

    for (const drawable of this.#inputManager.hoveredDrawables) {
      if (hasTooltip(drawable)) {
        if (!this.#currentTarget)
          this.#targetHoverTime = this.time.current;

        this.#currentTarget = drawable;
        this.#tooltip.tooltipText = drawable.tooltipText;

        foundTarget = true;
        break;
      }
    }

    if (!foundTarget) {
      this.#currentTarget = undefined;
      this.#tooltip.hide();
    }
    else if (this.time.current > this.#targetHoverTime + hover_time) {
      this.#tooltip.show();
    }
  }
}

class DrawableTooltip extends VisibilityContainer {
  readonly #spriteText: OsucadSpriteText;

  constructor() {
    super();

    this.hide();

    this.autoSizeAxes = Axes.Both;
    this.masking = true;
    this.cornerRadius = 4;

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
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
    const position = this.parent!
      .toLocalSpace(this.#inputManager.currentState.mouse.position)
      .sub(this.drawSize.scale(0.5));

    position.y -= 15;

    position.x = clamp(position.x, 0, this.parent!.drawWidth - this.drawWidth);
    position.y = clamp(position.y, 0, this.parent!.drawHeight - this.drawHeight);

    return position;
  }

  override update() {
    super.update();

    const targetPosition = this.targetPosition;
    this.position = targetPosition.lerp(this.position, Math.exp(-0.005 * this.time.elapsed));
  }
}
