import type { HoverEvent, HoverLostEvent, KeyDownEvent, KeyUpEvent, MouseDownEvent, MouseMoveEvent, ReadonlyDependencyContainer, Sample } from 'osucad-framework';
import { Anchor, Axes, Box, MaskingContainer, MouseButton } from 'osucad-framework';
import { DrawableSample } from '../../../drawables/DrawableSample';

export class IssueSample extends MaskingContainer {
  constructor(readonly sample: Sample) {
    super();
  }

  #background!: Box;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.X;
    this.height = 45;
    this.cornerRadius = 4;
    this.margin = { vertical: 4 };

    this.addAll(
      this.#background = new Box({
        relativeSizeAxes: Axes.Both,
        alpha: 0.1,
      }),
      new DrawableSample(this.sample, {
        relativeSizeAxes: Axes.Both,
        alpha: 0.5,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        height: 0.85,
      }),
      this.#previewLine = new Box({
        relativeSizeAxes: Axes.Y,
        relativePositionAxes: Axes.X,
        width: 1,
        origin: Anchor.TopCenter,
        alpha: 0,
      }),
    );
  }

  #shiftDown = false;

  #updatePreviewLine() {
    if (this.#shiftDown && this.isHovered) {
      this.#previewLine.alpha = 1;
    }
    else {
      this.#previewLine.alpha = 0;
    }
  }

  override onMouseMove(e: MouseMoveEvent): boolean {
    this.#previewLine.x = e.mousePosition.x / this.drawWidth;
    return true;
  }

  override onKeyDown(e: KeyDownEvent): boolean {
    this.#shiftDown = e.shiftPressed;
    this.#updatePreviewLine();
    return false;
  }

  override onKeyUp(e: KeyUpEvent) {
    this.#shiftDown = e.shiftPressed;
    this.#updatePreviewLine();
  }

  override onHover(e: HoverEvent): boolean {
    this.#background.alpha = 0.2;
    this.#updatePreviewLine();
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#background.alpha = 0.1;
    this.#updatePreviewLine();
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.play(e.shiftPressed
        ? e.mousePosition.x / this.drawWidth * this.sample.length
        : 0,
      );
      return true;
    }

    return false;
  }

  #previewLine!: Box;

  play(startTime: number = 0) {
    this.sample.play({
      offset: startTime,
    });

    const line = new Box({
      relativeSizeAxes: Axes.Both,
      relativePositionAxes: Axes.X,
      width: 0,
      x: startTime / this.sample.length,
      alpha: (1 - startTime / this.sample.length) * 0.65,
    });

    this.add(line);

    const duration = this.sample.length - startTime;

    line.resizeWidthTo(1 - startTime / this.sample.length, duration)
      .fadeOut(duration)
      .expire();
  }
}
