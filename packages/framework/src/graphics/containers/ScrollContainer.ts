import type {
  ClickEvent,
  DragEndEvent,
  DragEvent,
  DragStartEvent,
  MouseDownEvent,
  ScrollEvent,
} from '../../input';
import type { MouseButtonEventManager } from '../../input/MouseButtonEventManager';
import type { Drawable } from '../drawables';
import { Action } from '../../bindables';
import { Cached } from '../../caching/Cached';
import { MouseButton } from '../../input';
import { lerp } from '../../math/lerp';
import { Vec2 } from '../../math/Vec2';
import { almostBigger } from '../../utils/almostBigger';
import { almostEquals } from '../../utils/almostEquals';
import { clamp } from '../../utils/clamp';
import { debugAssert } from '../../utils/debugAssert';
import { Anchor, Axes, Direction, Invalidation, LayoutComputed } from '../drawables';
import { EasingFunction } from '../transforms/EasingFunction';
import { Container } from './Container';

const distance_decay_clamping = 0.012;

export abstract class ScrollContainer<T extends Drawable = Drawable> extends Container<T> {
  get scrollbarAnchor(): Anchor {
    return this.scrollbar.anchor;
  }

  set scrollbarAnchor(value: Anchor) {
    this.scrollbar.anchor = value;
    this.scrollbar.origin = value;
    this.#updatePadding();
  }

  #scrollbarVisible = true;

  get scrollbarVisible(): boolean {
    return this.#scrollbarVisible;
  }

  set scrollbarVisible(value: boolean) {
    this.#scrollbarVisible = value;
    this.#scrollbarCache.invalidate();
  }

  protected readonly scrollbar: ScrollbarContainer;

  #scrollbarOverlapsContent = true;

  get scrollbarOverlapsContent(): boolean {
    return this.#scrollbarOverlapsContent;
  }

  set scrollbarOverlapsContent(value: boolean) {
    this.#scrollbarOverlapsContent = value;
    this.#updatePadding();
  }

  get availableContent(): number {
    return this.scrollContent.drawSize[this.scrollDim];
  }

  get displayableContent(): number {
    return this.childSize[this.scrollDim];
  }

  scrollDistance = 80;

  clampExtension = 300;

  distanceDecayDrag = 0.0035;

  distanceDecayScroll = 0.01;

  distanceDecayJump = 0.01;

  #distanceDecay = 0;

  get current(): number {
    return this.#current;
  }

  #current = 0;

  get target(): number {
    return this.#target;
  }

  protected set target(value: number) {
    this.#target = value;
  }

  #target = 0;

  get scrollableExtent(): number {
    return Math.max(this.availableContent - this.displayableContent, 0);
  }

  get scrollbarMovementExtent(): number {
    return Math.max(this.displayableContent - this.scrollbar.drawSize[this.scrollDim], 0);
  }

  protected clamp(position: number, extension = 0): number {
    return Math.max(Math.min(position, this.scrollableExtent + extension), -extension);
  }

  override get content(): Container<T> {
    return this.scrollContent;
  }

  isScrolledToStart(lenience = 0.0001): boolean {
    return almostBigger(0, this.target, lenience);
  }

  isScrolledToEnd(lenience = 0.0001): boolean {
    return almostBigger(this.target, this.scrollableExtent, lenience);
  }

  readonly scrollContent: Container<T>;

  #isDragging = false;

  protected get isDragging(): boolean {
    return this.#isDragging;
  }

  readonly scrollDirection: Direction;

  protected get scrollDim(): 'x' | 'y' {
    return this.scrollDirection === Direction.Horizontal ? 'x' : 'y';
  }

  readonly #parentScrollContainerCache = new LayoutComputed<ScrollContainer | null>(
    () => this.findClosestParentOfType(ScrollContainer),
    Invalidation.Parent,
  );

  constructor(direction: Direction = Direction.Vertical) {
    super();
    this.scrollDirection = direction;

    this.masking = true;

    const scrollAxis = this.scrollDirection === Direction.Horizontal ? Axes.X : Axes.Y;

    this.addAllInternal(
      (this.scrollContent = new Container<T>({
        relativeSizeAxes: Axes.Both & ~scrollAxis,
        autoSizeAxes: scrollAxis,
      })),
      (this.scrollbar = this.createScrollbar(this.scrollDirection)),
    );

    this.scrollbar.hide();
    this.scrollbar.dragged.addListener(this.#onScrollbarMovement);
    this.scrollbarAnchor = this.scrollDirection === Direction.Vertical ? Anchor.TopRight : Anchor.BottomLeft;

    this.addLayout(this.#parentScrollContainerCache);
  }

  #lastUpdateDisplayableContent = -1;
  #lastAvailableContent = -1;

  #updateSize() {
    // ensure we only update scrollbar when something has changed, to avoid transform helpers resetting their transform every frame.
    // also avoids creating many needless Transforms every update frame.
    if (
      this.#lastAvailableContent !== this.availableContent
      || this.#lastUpdateDisplayableContent !== this.displayableContent
    ) {
      this.#lastAvailableContent = this.availableContent;
      this.#lastUpdateDisplayableContent = this.displayableContent;
      this.#scrollbarCache.invalidate();
    }
  }

  readonly #scrollbarCache = new Cached();

  #updatePadding() {
    if (this.#scrollbarOverlapsContent || this.availableContent <= this.displayableContent) {
      this.scrollContent.position = Vec2.zero();
    }
    else {
      if (this.scrollDirection === Direction.Vertical) {
        if (this.scrollbarAnchor === Anchor.TopLeft) {
          this.scrollContent.position = new Vec2(this.scrollbar.width + this.scrollbar.margin.left, 0);
        }
        else {
          this.scrollContent.position = new Vec2(-this.scrollbar.width - this.scrollbar.margin.right, 0);
        }
      }
      else {
        if (this.scrollbarAnchor === Anchor.TopLeft) {
          this.scrollContent.position = new Vec2(0, this.scrollbar.height + this.scrollbar.margin.top);
        }
        else {
          this.scrollContent.position = new Vec2(0, -this.scrollbar.height - this.scrollbar.margin.bottom);
        }
      }
    }

    // if (this.#scrollbarOverlapsContent || this.availableContent <= this.displayableContent) {
    //   this.scrollContent.padding = 0;
    // } else {
    //   if (this.scrollDirection === Direction.Vertical) {
    //     this.scrollContent.padding =
    //       this.scrollbarAnchor === Anchor.TopLeft
    //         ? new MarginPadding({ left: this.scrollbar.width + this.scrollbar.margin.left })
    //         : new MarginPadding({ right: this.scrollbar.width + this.scrollbar.margin.right });
    //   } else {
    //     this.scrollContent.padding =
    //       this.scrollbarAnchor === Anchor.TopLeft
    //         ? new MarginPadding({ top: this.scrollbar.height + this.scrollbar.margin.top })
    //         : new MarginPadding({ bottom: this.scrollbar.height + this.scrollbar.margin.bottom });
    //   }
    // }
  }

  override onDragStart(e: DragStartEvent): boolean {
    if (this.isDragging || e.button !== MouseButton.Left || this.content.aliveInternalChildren.length === 0)
      return false;

    if (
      this.#parentScrollContainerCache.value !== null
      && this.#parentScrollContainerCache.value.scrollDirection !== this.scrollDirection
    ) {
      const dragWasMostlyHorizontal = Math.abs(e.delta.x) > Math.abs(e.delta.y);
      if (dragWasMostlyHorizontal !== (this.scrollDirection === Direction.Horizontal))
        return false;
    }

    this.#lastDragTime = this.time.current;
    this.#averageDragDelta = this.#averageDragTime = 0;

    this.#isDragging = true;

    this.#dragButtonManager = this.getContainingInputManager()!.getMouseButtonEventManagerFor(e.button);

    return true;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (this.isDragging || e.button !== MouseButton.Left)
      return false;

    // Continue from where we currently are scrolled to.
    this.#target = this.current;
    return false;
  }

  #lastDragTime = 0;
  #averageDragTime = 0;
  #averageDragDelta = 0;

  #dragButtonManager: MouseButtonEventManager | null = null;

  #dragBlocksClick = false;

  override get dragBlocksClick(): boolean {
    return this.#dragBlocksClick;
  }

  override onDrag(e: DragEvent): boolean {
    debugAssert(this.isDragging, 'onDrag called when not dragging');

    const currentTime = this.time.current;
    const timeDelta = currentTime - this.#lastDragTime;
    const decay = 0.95 ** timeDelta;

    this.#averageDragTime = this.#averageDragTime * decay + timeDelta;
    this.#averageDragDelta = this.#averageDragDelta * decay - e.delta[this.scrollDim];

    this.#lastDragTime = currentTime;

    const childDelta = this.toLocalSpace(e.screenSpaceMousePosition).sub(
      this.toLocalSpace(e.screenSpaceLastMousePosition),
    );

    let scrollOffset = -childDelta[this.scrollDim];
    const clampedScrollOffset = this.clamp(this.target + scrollOffset) - this.clamp(this.target);

    debugAssert(almostBigger(Math.abs(scrollOffset), clampedScrollOffset * Math.sign(scrollOffset)));

    scrollOffset = clampedScrollOffset + (scrollOffset - clampedScrollOffset) / 2;

    this.#dragBlocksClick
      ||= Math.abs(
        this.toLocalSpace(e.screenSpaceMouseDownPosition)[this.scrollDim]
        - this.toLocalSpace(e.screenSpaceMousePosition)[this.scrollDim],
      ) > this.#dragButtonManager!.clickDragDistance;

    this.#scrollByOffset(scrollOffset, false);

    return true;
  }

  override onDragEnd(e: DragEndEvent): boolean {
    debugAssert(this.isDragging, 'We should never receive OnDragEnd if we are not dragging.');

    this.#dragBlocksClick = false;
    this.#dragButtonManager = null;
    this.#isDragging = false;

    if (this.#averageDragTime <= 0.0)
      return false;

    let velocity = this.#averageDragDelta / this.#averageDragTime;

    const velocity_cutoff = 0.1;
    if (Math.abs(0.95 ** (this.time.current - this.#lastDragTime) * velocity) < velocity_cutoff) {
      velocity = 0;
    }

    const distance = velocity / (1 - Math.exp(-this.distanceDecayDrag));

    this.#scrollByOffset(distance, true, this.distanceDecayDrag);

    return true;
  }

  override onScroll(e: ScrollEvent): boolean {
    if (this.content.aliveInternalChildren.length === 0 || e.altPressed || e.controlPressed)
      return false;

    if (
      this.#parentScrollContainerCache.value !== null
      && this.#parentScrollContainerCache.value.scrollDirection !== this.scrollDirection
    ) {
      const scrollWasMostlyHorizontal = Math.abs(e.scrollDelta.x) > Math.abs(e.scrollDelta.y);

      // For horizontal scrolling containers, vertical scroll is also used to perform horizontal traversal.
      // Due to this, we only block horizontal scroll in vertical containers, but not vice-versa.
      if (scrollWasMostlyHorizontal && this.scrollDirection === Direction.Vertical) {
        return false;
      }
    }

    const isPrecise = e.isPrecise;

    const scrollDelta = e.scrollDelta;
    let scrollDeltaFloat = scrollDelta.y;
    if (this.scrollDirection === Direction.Horizontal && scrollDelta.x !== 0) {
      scrollDeltaFloat = scrollDelta.x;
    }

    this.#scrollByOffset(this.scrollDistance * -scrollDeltaFloat, true, isPrecise ? 0.05 : this.distanceDecayScroll);
    return true;
  }

  #onScrollbarMovement = (value: number) => {
    this.onUserScroll(this.clamp(this.#fromScrollbarPosition(value)), false);
  };

  offsetScrollPosition(offset: number) {
    this.#target += offset;
    this.#current += offset;
  }

  #scrollByOffset(value: number, animated: boolean, distanceDecay = Infinity) {
    this.onUserScroll(this.target + value, animated, distanceDecay);
  }

  scrollToStart(animated = true, allowDuringDrag = false) {
    if (!this.isDragging || allowDuringDrag) {
      this.#scrollTo(0, animated, this.distanceDecayJump);
    }
  }

  scrollToEnd(animated = true, allowDuringDrag = false) {
    if (!this.isDragging || allowDuringDrag) {
      this.#scrollTo(this.scrollableExtent, animated, this.distanceDecayJump);
    }
  }

  scrollBy(value: number, animated = true) {
    this.#scrollTo(this.target + value, animated);
  }

  onUserScroll(value: number, animated = true, distanceDecay?: number) {
    this.scrollTo(value, animated, distanceDecay);
  }

  scrollTo(value: number, animated = true, distanceDecay?: number) {
    this.#scrollTo(value, animated, distanceDecay ?? this.distanceDecayJump);
  }

  #scrollTo(value: number, animated = true, distanceDecay = Infinity) {
    this.#target = this.clamp(value, this.clampExtension);

    if (animated) {
      this.#distanceDecay = distanceDecay;
    }
    else {
      this.#current = this.target;
    }
  }

  scrollIntoView(d: Drawable, animated = true) {
    const childPos0 = this.getChildPosInContent(d);
    const childPos1 = this.getChildPosInContent(d, d.drawSize);

    const minPos = Math.min(childPos0, childPos1);
    const maxPos = Math.max(childPos0, childPos1);

    if (minPos < this.current || (minPos > this.current && d.drawSize[this.scrollDim] > this.displayableContent))
      this.scrollTo(minPos, animated);
    else if (maxPos > this.current + this.displayableContent)
      this.scrollTo(maxPos - this.displayableContent, animated);
  }

  getChildPosInContent(d: Drawable, offset: Vec2 = Vec2.zero()) {
    return d.toSpaceOfOtherDrawable(offset, this.scrollContent)[this.scrollDim];
  }

  #updatePosition() {
    let localDistanceDecay = this.#distanceDecay;

    // If we are not currently dragging the content, and we have scrolled out of bounds,
    // then we should handle the clamping force. Note, that if the target is _within_
    // acceptable bounds, then we do not need special handling of the clamping force, as
    // we will naturally scroll back into acceptable bounds.
    if (!this.isDragging && this.current !== this.clamp(this.current) && this.target !== this.clamp(this.target, -0.01)) {
      // Firstly, we want to limit how far out the target may go to limit overly bouncy
      // behaviour with extreme scroll velocities.
      this.#target = this.clamp(this.target, this.clampExtension);

      // Secondly, we would like to quickly approach the target while we are out of bounds.
      // This is simulating a "strong" clamping force towards the target.
      if (
        (this.current < this.target && this.target < 0)
        || (this.current > this.target && this.target > this.scrollableExtent)
      ) {
        localDistanceDecay = distance_decay_clamping * 2;
      }

      // Lastly, we gradually nudge the target towards valid bounds.
      this.#target = lerp(this.clamp(this.target), this.target, Math.exp(-distance_decay_clamping * this.time.elapsed));

      const clampedTarget = this.clamp(this.target);
      if (almostEquals(clampedTarget, this.target)) {
        this.#target = clampedTarget;
      }
    }

    // Exponential interpolation between the target and our current scroll position.
    this.#current = lerp(this.target, this.current, Math.exp(-localDistanceDecay * this.time.elapsed));

    // This prevents us from entering the de-normalized range of floating point numbers when approaching target closely.
    if (almostEquals(this.current, this.target)) {
      this.#current = this.target;
    }
  }

  override updateAfterChildren(): void {
    super.updateAfterChildren();

    this.#updateSize();
    this.#updatePosition();

    if (!this.#scrollbarCache.isValid) {
      const size = this.scrollDirection === Direction.Horizontal ? this.drawSize.x : this.drawSize.y;
      if (size > 0) {
        this.scrollbar.resizeScrollbarTo(
          clamp(
            this.availableContent > 0 ? this.displayableContent / this.availableContent : 0,
            Math.min(this.scrollbar.minimumDimSize / size, 1),
            1,
          ),
          200,
          EasingFunction.OutQuart,
        );
      }

      this.scrollbar.fadeTo(this.scrollbarVisible && this.availableContent - 1 > this.displayableContent ? 1 : 0, 200);
      this.#updatePadding();

      this.#scrollbarCache.validate();
    }

    if (this.scrollDirection === Direction.Horizontal) {
      this.scrollbar.x = this.#toScrollbarPosition(this.current);
      this.scrollContent.x = -this.current + this.scrollableExtent * this.scrollContent.relativeAnchorPosition.x;
    }
    else {
      this.scrollbar.y = this.#toScrollbarPosition(this.current);
      this.scrollContent.y = -this.current + this.scrollableExtent * this.scrollContent.relativeAnchorPosition.y;
    }
  }

  #toScrollbarPosition(scrollPosition: number): number {
    if (almostEquals(0, this.scrollableExtent))
      return 0;

    return this.scrollbarMovementExtent * (scrollPosition / this.scrollableExtent);
  }

  #fromScrollbarPosition(scrollbarPosition: number): number {
    if (almostEquals(0, this.scrollbarMovementExtent))
      return 0;

    return this.scrollableExtent * (scrollbarPosition / this.scrollbarMovementExtent);
  }

  protected abstract createScrollbar(direction: Direction): ScrollbarContainer;
}

export abstract class ScrollbarContainer extends Container {
  #dragOffset = 0;

  readonly dragged = new Action<number>();

  readonly scrollDirection: Direction;

  get minimumDimSize(): number {
    return this.size[this.scrollDirection === Direction.Vertical ? 'x' : 'y'];
  }

  constructor(direction: Direction) {
    super();
    this.scrollDirection = direction;

    this.relativeSizeAxes = direction === Direction.Horizontal ? Axes.X : Axes.Y;
  }

  abstract resizeScrollbarTo(val: number, duration?: number, easing?: EasingFunction): void;

  override onClick(e: ClickEvent): boolean {
    return true;
  }

  override onDragStart(e: DragStartEvent): boolean {
    if (e.button !== MouseButton.Left)
      return false;

    const dim = this.scrollDirection === Direction.Horizontal ? 'x' : 'y';

    this.#dragOffset = this.parent!.toLocalSpace(e.screenSpaceMousePosition)[dim] - this.position[dim];
    return true;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button !== MouseButton.Left)
      return false;

    const dim = this.scrollDirection === Direction.Horizontal ? 'x' : 'y';

    this.#dragOffset = this.position[dim];
    this.dragged.emit(this.#dragOffset);
    return true;
  }

  override onDrag(e: DragEvent): boolean {
    const dim = this.scrollDirection === Direction.Horizontal ? 'x' : 'y';
    this.dragged.emit(this.parent!.toLocalSpace(e.screenSpaceMousePosition)[dim] - this.#dragOffset);
    return true;
  }
}
