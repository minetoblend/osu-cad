import type { Drawable, ScrollEvent } from 'osucad-framework';
import { Axes, BindableNumber, clamp, Container, Direction, EasingFunction, Invalidation, LayoutMember, TypedTransform, Vec2 } from 'osucad-framework';
import { OsucadScrollContainer } from '../../../drawables/OsucadScrollContainer';
import { animate } from '../../../utils/animate';

export interface ZoomableScrollContainerOptions {
  minZoom: number;
  maxZoom: number;
  initialZoom: number;
}

export abstract class ZoomableScrollContainer extends OsucadScrollContainer {
  zoomDuration = 0;

  zoomEasing: EasingFunction = EasingFunction.Default;

  readonly #zoomedContent: Container;

  override get content(): Container<Drawable> {
    return this.#zoomedContent;
  }

  readonly currentZoom = new BindableNumber(1);

  #isZoomSetUp = false;

  readonly #zoomedContentWidthCache = new LayoutMember(Invalidation.DrawSize);

  #minZoom = 0;
  #maxZoom = 0;

  protected constructor(options?: ZoomableScrollContainerOptions) {
    super(Direction.Horizontal);

    super.content.add(this.#zoomedContent = new Container({
      relativeSizeAxes: Axes.Y,
      alpha: 0,
    }));

    this.addLayout(this.#zoomedContentWidthCache);

    if (options)
      this.setupZoom(options.initialZoom, options.minZoom, options.maxZoom);
  }

  setupZoom(initial: number, minimum: number, maximum: number) {
    if (minimum < 1)
      throw new Error(`minimum (${minimum}) must be >= than 1`);

    if (maximum < 1)
      throw new Error(`maximum (${maximum}) must be >= than 1`);

    this.#minZoom = minimum;
    this.#maxZoom = maximum;

    this.currentZoom.value = this.#zoomTarget = initial;
    this.#zoomedContentWidthCache.invalidate();

    this.#isZoomSetUp = true;
    this.#zoomedContent.show();
  }

  get zoom() {
    return this.#zoomTarget;
  }

  set zoom(value: number) {
    this.#updateZoom(value);
  }

  #updateZoom(value: number) {
    if (!this.#isZoomSetUp)
      return;

    const newZoom = clamp(value, this.#minZoom, this.#maxZoom);

    if (this.isLoaded)
      this.#setZoomTarget(newZoom, this.toSpaceOfOtherDrawable(new Vec2(this.drawWidth / 2, 0), this.#zoomedContent).x);
    else
      this.currentZoom.value = this.#zoomTarget = newZoom;
  }

  override updateAfterChildren() {
    super.updateAfterChildren();

    if (!this.#zoomedContentWidthCache.isValid)
      this.updateZoomedContentWidth();
  }

  override onScroll(e: ScrollEvent): boolean {
    if (e.altPressed) {
      this.adjustZoomRelatively(e.scrollDelta.y, this.#zoomedContent.toLocalSpace(e.screenSpaceMousePosition).x);
      return true;
    }

    return super.onScroll(e);
  }

  updateZoomedContentWidth() {
    this.#zoomedContent.width = this.drawWidth * this.currentZoom.value;
    this.#zoomedContentWidthCache.validate();
  }

  adjustZoomRelatively(change: number, focusPoint?: number) {
    if (!this.#isZoomSetUp)
      return;

    const zoom_change_sensitivity = 0.02;

    this.#setZoomTarget(this.#zoomTarget + change * (this.#maxZoom - this.#minZoom) * zoom_change_sensitivity, focusPoint);
  }

  #zoomTarget = 1;

  #setZoomTarget(newZoom: number, focusPoint?: number) {
    this.#zoomTarget = clamp(newZoom, this.#minZoom, this.#maxZoom);
    focusPoint ??= this.#zoomedContent.toLocalSpace(this.toScreenSpace(new Vec2(this.drawWidth / 2, 0))).x;

    this.#transformZoomTo(this.#zoomTarget, focusPoint, this.zoomDuration, this.zoomEasing);

    this.onZoomChanged();
  }

  #transformZoomTo(newZoom: number, focusPoint: number, duration: number = 0, easing: EasingFunction) {
    this.addTransform(
      this.populateTransform(new TransformZoom(focusPoint, this.#zoomedContent.drawWidth, this.current), newZoom, duration, easing),
    );
  }

  protected onZoomChanged() {
  }
}

class TransformZoom<T extends ZoomableScrollContainer> extends TypedTransform<number, T> {
  constructor(
    readonly focusPoint: number,
    readonly contentSize: number,
    readonly scrollOffset: number,
  ) {
    super();
  }

  #valueAt(time: number) {
    return animate(time, this.startTime, this.endTime, this.startValue, this.endValue, this.easing);
  }

  override applyTo(target: T, time: number): void {
    const newZoom = this.#valueAt(time);

    const focusOffset = this.focusPoint - this.scrollOffset;
    const expectedWidth = target.drawWidth * newZoom;
    const targetOffset = expectedWidth * (this.focusPoint / this.contentSize) - focusOffset;

    target.currentZoom.value = newZoom;
    target.updateZoomedContentWidth();

    target.invalidate(Invalidation.DrawSize);
    target.scrollTo(targetOffset, false);
  }

  override readIntoStartValueFrom(target: T): void {
    this.startValue = target.currentZoom.value;
  }

  override get targetMember(): string {
    return 'currentZoom';
  }

  override clone(): TypedTransform<number, T> {
    throw new Error('Not applicable.');
  }
}
