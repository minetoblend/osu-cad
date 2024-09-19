import type {
  Bindable,
  IVec2,
  MouseDownEvent,
} from 'osucad-framework';
import {
  Action,
  Anchor,
  Axes,
  BindableWithCurrent,
  Box,
  CompositeDrawable,
  Container,
  dependencyLoader,
  EasingFunction,
  LoadState,
  MaskingContainer,
  MouseButton,
  resolved,
  Vec2,
} from 'osucad-framework';
import { ThemeColors } from '../editor/ThemeColors.ts';
import { OsucadSpriteText } from '../OsucadSpriteText.ts';

export interface AdjustmentButtonOptions {
  size?: IVec2;
  adjustments?: number[];
  label?: string;
  bindable?: Bindable<number>;
}

export class AdjustmentButton extends CompositeDrawable {
  constructor(
    options: AdjustmentButtonOptions = {},
  ) {
    super();

    this.text = options.label ?? '';
    this.adjustments = options.adjustments ?? [1, 2, 5];
    this.size = options.size ?? new Vec2(10, 10);

    if (options.bindable)
      this.current = options.bindable;
  }

  readonly adjustments: number[];

  #text: string = '';

  #label!: OsucadSpriteText;

  get text() {
    return this.#text;
  }

  set text(value: string) {
    if (this.#text === value)
      return;

    this.#text = value;
    if (this.loadState >= LoadState.Ready)
      this.#label.text = value;
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.addInternal(
      new MaskingContainer({
        cornerRadius: 6,
        relativeSizeAxes: Axes.Both,
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: 0x222228,
          }),
          this.#content = new Container({
            relativeSizeAxes: Axes.Both,
          }),
          this.#hoverOverlay = new Box({
            relativeSizeAxes: Axes.Both,
            relativePositionAxes: Axes.Both,
            color: this.colors.primary,
            alpha: 0,
            blendMode: 'add',
          }),
          this.#label = new OsucadSpriteText({
            text: this.text,
            fontSize: 15,
            color: this.colors.text,
            anchor: Anchor.Center,
            origin: Anchor.Center,
          }),
          this.#adjustmentText = new OsucadSpriteText({
            text: '+1',
            fontSize: 9,
            y: 2,
            alpha: 0,
            anchor: Anchor.TopCenter,
            origin: Anchor.TopCenter,
          }),
        ],
      }),
    );

    for (let i = 0; i < this.adjustments.length; i++) {
      const adjustment = this.adjustments[this.adjustments.length - 1 - i];

      const brightness = ((i + 1) / this.adjustments.length) * 0.15;

      const negativePiece = new AdjustmentButtonPiece(-adjustment, brightness).with({
        relativeSizeAxes: Axes.Both,
        relativePositionAxes: Axes.Both,
        x: i / this.adjustments.length / 2,
        width: 1 / this.adjustments.length / 2,
      });

      const positivePiece = new AdjustmentButtonPiece(adjustment, brightness).with({
        relativeSizeAxes: Axes.Both,
        relativePositionAxes: Axes.Both,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        x: -i / this.adjustments.length / 2,
        width: 1 / this.adjustments.length / 2,
      });

      this.#content.addAll(negativePiece, positivePiece);

      negativePiece.hovered.addListener(this.onPieceHovered, this);
      positivePiece.hovered.addListener(this.onPieceHovered, this);
    }
  }

  #content!: Container;

  #hoverOverlay!: Box;

  #adjustmentText!: OsucadSpriteText;

  protected onPieceHovered(piece: AdjustmentButtonPiece) {
    const positive = piece.adjustment > 0;

    if (positive) {
      this.#hoverOverlay.anchor = Anchor.TopCenter;
      this.#hoverOverlay.origin = Anchor.TopLeft;
      this.#hoverOverlay.x = 0;
      this.#hoverOverlay.width = 0.5 + piece.x;
      this.#adjustmentText.origin = Anchor.TopLeft;
      this.#adjustmentText.x = 3;
    }
    else {
      this.#hoverOverlay.anchor = Anchor.TopCenter;
      this.#hoverOverlay.origin = Anchor.TopRight;
      this.#hoverOverlay.x = 0;
      this.#hoverOverlay.width = 0.5 - piece.x;
      this.#adjustmentText.origin = Anchor.TopRight;
      this.#adjustmentText.x = -3;
    }

    this.#adjustmentText.text = piece.adjustment > 0 ? `+${piece.adjustment}` : piece.adjustment.toString();

    this.#currentAdjustment = piece.adjustment;
  }

  onHover() {
    this.#hoverOverlay.fadeTo(0.2).fadeTo(0.15, 100);
    this.#label.color = 0xFFFFFF;
    this.#adjustmentText.fadeTo(1, 100)
      .moveToY(-4)
      .moveToY(2, 500, EasingFunction.OutExpo);

    return true;
  }

  onHoverLost() {
    this.#hoverOverlay.fadeOut(100);
    this.#label.color = this.colors.text;
    this.#adjustmentText.fadeOut(100);
  }

  #currentAdjustment = 0;

  #current = new BindableWithCurrent(0);

  get current() {
    return this.#current.current;
  }

  set current(value) {
    this.#current.current = value;
  }

  onAdjustmentChanged = new Action<number>();

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left && !this.#current.disabled) {
      this.onAdjustmentChanged.emit(this.#currentAdjustment);

      this.current.value = Math.round(
        (this.current.value + this.#currentAdjustment) * 10000,
      ) / 10000;

      this.#adjustmentText.moveToY(-4).moveToY(2, 500, EasingFunction.OutExpo);
      this.#hoverOverlay.fadeTo(0.3).fadeTo(0.15, 500, EasingFunction.OutExpo);

      return true;
    }

    return false;
  }
}

class AdjustmentButtonPiece extends CompositeDrawable {
  constructor(
    readonly adjustment: number,
    readonly baseBrightness = 0,
  ) {
    super();
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        alpha: this.baseBrightness,
      }),
    );
  }

  hovered = new Action<AdjustmentButtonPiece>();

  onHover(): boolean {
    this.hovered.emit(this);

    return false;
  }
}
