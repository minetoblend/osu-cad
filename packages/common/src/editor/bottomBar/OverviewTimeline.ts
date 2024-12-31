import type {
  DragEvent,
  DragStartEvent,
  HoverEvent,
  HoverLostEvent,
  MouseDownEvent,
  ReadonlyDependencyContainer,
  UIEvent,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  CompositeDrawable,
  EasingFunction,
  FastRoundedBox,
  resolved,
  Vec2,
} from 'osucad-framework';
import { EditorClock } from '../EditorClock';

export class OverviewTimeline extends CompositeDrawable {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(
      new FastRoundedBox({
        relativeSizeAxes: Axes.X,
        height: 4,
        cornerRadius: 2,
        alpha: 0.1,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }),
      this.#track = new FastRoundedBox({
        relativeSizeAxes: Axes.X,
        width: 0,
        height: 4,
        cornerRadius: 2,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }),
      this.#thumb = new Thumb(),
    );
  }

  #track!: FastRoundedBox;

  #thumb!: Thumb;

  override update() {
    super.update();

    this.#track.width = this.#thumb.x
        = this.editorClock.currentTime / this.editorClock.trackLength;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  #seekToMouse(e: UIEvent) {
    const time = (e.mousePosition.x / this.drawWidth) * this.editorClock.trackLength;
    this.editorClock.seek(time, false);
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    this.#seekToMouse(e);
    return true;
  }

  override onDragStart(e: DragStartEvent): boolean {
    return true;
  }

  override onDrag(e: DragEvent): boolean {
    this.#seekToMouse(e);
    return true;
  }
}

class Thumb extends CompositeDrawable {
  constructor() {
    super();

    this.size = new Vec2(20, 14);
    this.anchor = Anchor.CenterLeft;
    this.origin = Anchor.Center;
    this.relativePositionAxes = Axes.X;

    this.addInternal(this.#thumb = new FastRoundedBox({
      size: new Vec2(14, 8),
      cornerRadius: 4,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));
  }

  #thumb!: FastRoundedBox;

  override onHover(e: HoverEvent): boolean {
    this.#thumb.scaleTo(1.3, 200, EasingFunction.OutExpo);
    return false;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#thumb.scaleTo(1, 200, EasingFunction.OutExpo);
  }
}
