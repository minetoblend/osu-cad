import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { DrawableHitObject } from '../../../hitObjects/drawables/DrawableHitObject';
import type { HitObjectLifetimeEntry } from '../../../hitObjects/drawables/HitObjectLifetimeEntry';
import type { IScrollAlgorithm } from './algorithms/IScrollAlgorithm';
import { Axes, Bindable, BindableNumber, Direction, Invalidation, LayoutMember, Rectangle, resolved, Vec2 } from 'osucad-framework';
import { HitObjectContainer } from '../HitObjectContainer';
import { ConstantScrollAlgorithm } from './algorithms/ConstantScrollAlgorithm';
import { IScrollingInfo } from './IScrollingInfo';
import { ScrollingDirection } from './ScrollingDirection';

export class ScrollingHitObjectContainer extends HitObjectContainer {
  private timeRange = new BindableNumber();
  private direction = new Bindable<ScrollingDirection>(ScrollingDirection.Up);
  private algorithm = new Bindable<IScrollAlgorithm>(new ConstantScrollAlgorithm());

  get scrollingAxis(): Direction {
    return (this.direction.value === ScrollingDirection.Left || this.direction.value === ScrollingDirection.Right) ? Direction.Horizontal : Direction.Vertical;
  }

  get axisInverted(): boolean {
    return this.direction.value === ScrollingDirection.Down || this.direction.value === ScrollingDirection.Right;
  }

  @resolved(IScrollingInfo)
  protected scrollingInfo!: IScrollingInfo;

  readonly #layoutComputed = new Set<DrawableHitObject>();

  readonly #layoutCache = new LayoutMember(Invalidation.RequiredParentSizeToFit | Invalidation.Transform);

  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.addLayout(this.#layoutCache);
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.direction.bindTo(this.scrollingInfo.direction);
    this.timeRange.bindTo(this.scrollingInfo.timeRange);
    this.algorithm.bindTo(this.scrollingInfo.algorithm);

    this.direction.valueChanged.addListener(() => this.#layoutCache.invalidate());
    this.timeRange.valueChanged.addListener(() => this.#layoutCache.invalidate());
    this.algorithm.valueChanged.addListener(() => this.#layoutCache.invalidate());
  }

  timeAtPosition(localPosition: number, currentTime: number) {
    const scrollPosition = this.axisInverted ? -localPosition : localPosition;
    return this.algorithm.value.timeAt(scrollPosition, currentTime, this.timeRange.value, this.#scrollLength);
  }

  timeAtScreenSpacePosition(screenSpacePosition: Vec2) {
    const pos = this.toLocalSpace(screenSpacePosition);
    let localPosition = this.scrollingAxis === Direction.Horizontal ? pos.x : pos.y;
    localPosition -= this.axisInverted ? this.#scrollLength : 0;
    return this.timeAtPosition(localPosition, this.time.current);
  }

  positionAtTime(time: number, currentTime: number = this.time.current, originTime?: number) {
    const scrollPosition = this.algorithm.value.positionAt(time, currentTime, this.timeRange.value, this.#scrollLength, originTime);
    return this.axisInverted ? -scrollPosition : scrollPosition;
  }

  screenSpacePositionAtTime(time: number) {
    let localPosition = this.positionAtTime(time, this.time.current);
    localPosition += this.axisInverted ? this.#scrollLength : 0;
    return this.scrollingAxis === Direction.Horizontal
      ? this.toScreenSpace(new Vec2(localPosition, this.drawHeight / 2))
      : this.toScreenSpace(new Vec2(this.drawWidth / 2, localPosition));
  }

  lengthAtTime(startTime: number, endTime: number) {
    return this.algorithm.value.getLength(startTime, endTime, this.timeRange.value, this.#scrollLength);
  }

  get #scrollLength() {
    return this.scrollingAxis === Direction.Horizontal ? this.drawWidth : this.drawHeight;
  }

  override addEntry(entry: HitObjectLifetimeEntry) {
    if (this.isLoaded)
      this.#setComputedLifetime(entry);

    super.addEntry(entry);
  }

  protected override addDrawable(entry: HitObjectLifetimeEntry, drawable: DrawableHitObject) {
    super.addDrawable(entry, drawable);

    this.#invalidateHitObject(drawable);
    drawable.defaultsApplied.addListener(this.#invalidateHitObject, this);
  }

  protected override removeDrawable(entry: HitObjectLifetimeEntry, drawable: DrawableHitObject) {
    super.removeDrawable(entry, drawable);

    drawable.defaultsApplied.removeListener(this.#invalidateHitObject, this);
    this.#layoutComputed.delete(drawable);
  }

  #invalidateHitObject(hitObject: DrawableHitObject) {
    this.#layoutComputed.delete(hitObject);
  }

  override update() {
    super.update();

    if (this.#layoutCache.isValid)
      return;

    this.#layoutComputed.clear();

    for (const entry of this.entries)
      this.#setComputedLifetime(entry);

    this.algorithm.value.reset();

    this.#layoutCache.validate();
  }

  override updateAfterChildrenLife() {
    super.updateAfterChildrenLife();

    for (const [entry, obj] of this.aliveEntries) {
      this.#updatePosition(obj, this.time.current);

      if (this.#layoutComputed.has(obj))
        continue;

      this.#updateLayoutRecursive(obj);

      this.#layoutComputed.add(obj);
    }
  }

  getConservativeBoundingBox(entry: HitObjectLifetimeEntry) {
    return new Rectangle(0, 0, 0, 0).inflate(100);
  }

  #computeDisplayStartTime(entry: HitObjectLifetimeEntry) {
    const boundingBox = this.getConservativeBoundingBox(entry);
    let startOffset = 0;

    switch (this.direction.value) {
      case ScrollingDirection.Right:
        startOffset = boundingBox.right;
        break;

      case ScrollingDirection.Down:
        startOffset = boundingBox.bottom;
        break;

      case ScrollingDirection.Left:
        startOffset = -boundingBox.left;
        break;

      case ScrollingDirection.Up:
        startOffset = -boundingBox.top;
        break;
    }

    return this.algorithm.value.getDisplayStartTime(entry.hitObject.startTime, startOffset, this.timeRange.value, this.#scrollLength);
  }

  #setComputedLifetime(entry: HitObjectLifetimeEntry) {
    const computedStartTime = this.#computeDisplayStartTime(entry);

    entry.lifetimeStart = Math.min(entry.hitObject.startTime - entry.hitObject.maximumJudgementOffset, computedStartTime);

    entry.lifetimeEnd = entry.hitObject.endTime + this.timeRange.value;
  }

  #updateLayoutRecursive(hitObject: DrawableHitObject, parentHitObjectStartTime?: number) {
    parentHitObjectStartTime ??= hitObject.hitObject!.startTime;

    if (hitObject.hitObject!.duration !== 0) {
      const length = this.lengthAtTime(hitObject.hitObject!.startTime, hitObject.hitObject!.endTime);
      if (this.scrollingAxis === Direction.Horizontal)
        hitObject.width = length;
      else
        hitObject.height = length;
    }

    for (const obj of hitObject.nestedHitObjects) {
      this.#updateLayoutRecursive(obj, parentHitObjectStartTime);

      this.#updatePosition(obj, hitObject.hitObject!.startTime, parentHitObjectStartTime);
      this.#setComputedLifetime(obj.entry!);
    }
  }

  #updatePosition(hitObject: DrawableHitObject, currentTime: number, parentHitObjectStartTime?: number) {
    const position = this.positionAtTime(hitObject.hitObject!.startTime, currentTime, parentHitObjectStartTime);

    if (this.scrollingAxis === Direction.Horizontal)
      hitObject.x = position;
    else
      hitObject.y = position;
  }
}
