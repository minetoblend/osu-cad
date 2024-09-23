import type { Scheduler } from '../../scheduling/Scheduler.ts';
import type { IComparer } from '../../utils/IComparer.ts';
import type { AbsoluteSequenceSender } from '../transforms/AbsoluteSequenceSender.ts';
import { Action } from '../../bindables/Action.ts';
import { DependencyContainer } from '../../di';
import { type IVec2, Vec2 } from '../../math/Vec2';
import { PIXIContainer, PIXIGraphics } from '../../pixi';
import { type IUsable, ValueInvokeOnDisposal } from '../../types/IUsable.ts';
import { debugAssert } from '../../utils/debugAssert';
import { List } from '../../utils/List.ts';
import { SortedList } from '../../utils/SortedList.ts';
import { Anchor } from '../drawables';
import { Axes } from '../drawables/Axes';
import {
  Drawable,
  type DrawableOptions,
  Invalidation,
  InvalidationSource,
  loadDrawable,
  loadDrawableFromAsync,
  LoadState,
} from '../drawables/Drawable';
import { LayoutMember } from '../drawables/LayoutMember';
import { MarginPadding, type MarginPaddingOptions } from '../drawables/MarginPadding';
import { EasingFunction } from '../transforms/EasingFunction.ts';

export interface CompositeDrawableOptions extends DrawableOptions {
  padding?: MarginPaddingOptions;
  autoSizeAxes?: Axes;
  masking?: boolean;
}

export class ChildComparer implements IComparer<Drawable> {
  constructor(private readonly owner: CompositeDrawable) {
  }

  compare = (a: Drawable, b: Drawable) => {
    return this.owner.compare(a, b);
  };
}

export class CompositeDrawable extends Drawable {
  constructor() {
    super();

    const comparer = new ChildComparer(this);

    this.#internalChildren = new SortedList<Drawable>(comparer);
    this.#aliveInternalChildren = new SortedList<Drawable>(comparer);

    this.addLayout(this.#childrenSizeDependencies);
  }

  override createDrawNode(): PIXIContainer {
    return new PIXIContainer();
  }

  readonly childBecameAlive = new Action<Drawable>();

  readonly childDied = new Action<Drawable>();

  readonly #internalChildren: SortedList<Drawable>;

  #aliveInternalChildren: SortedList<Drawable>;

  get internalChildren(): ReadonlyArray<Drawable> {
    return this.#internalChildren.items;
  }

  set internalChildren(value) {
    this.clearInternal();
    this.addAllInternal(...value);
  }

  get internalChild(): Drawable {
    if (this.internalChildren.length !== 1) {
      throw new Error(
        `Cannot call internalChild unless there's exactly one Drawable in internalChildren (currently ${this.internalChildren.length})!`,
      );
    }

    return this.internalChildren[0];
  }

  set internalChild(value: Drawable) {
    if (this.isDisposed)
      return;

    this.clearInternal();
    this.addInternal(value);
  }

  get aliveInternalChildren(): ReadonlyArray<Drawable> {
    return this.#aliveInternalChildren.items;
  }

  #currentChildId = 0;

  override with(options: CompositeDrawableOptions) {
    return super.with(options);
  }

  protected addInternal<T extends Drawable>(drawable: T) {
    if (this.isDisposed) {
      return;
    }

    if (drawable.childId !== 0) {
      throw new Error('May not add a drawable to multiple containers.');
    }

    drawable.childId = ++this.#currentChildId;
    drawable.removeCompletedTransforms = this.removeCompletedTransforms;

    if (this.loadState >= LoadState.Loading) {
      if (drawable.loadState >= LoadState.Ready) {
        drawable.parent = this;
      } else {
        this.#loadChild(drawable);
      }
    }

    this.#internalChildren.add(drawable);

    if (this.autoSizeAxes !== Axes.None)
      this.invalidate(Invalidation.RequiredParentSizeToFit, InvalidationSource.Child);

    return drawable;
  }

  compare(a: Drawable, b: Drawable) {
    const i = b.depth - a.depth;
    if (i !== 0)
      return i;

    return a.childId - b.childId;
  }

  changeInternalChildDepth(child: Drawable, newDepth: number) {
    if (child.depth === newDepth)
      return;

    const index = this.indexOfInternal(child);
    if (index < 0)
      throw new Error('Can not change depth of drawable which is not contained within this CompositeDrawable.');

    this.#internalChildren.removeAt(index);
    const aliveIndex = this.#aliveInternalChildren.indexOf(child);
    if (aliveIndex >= 0) {
      this.#aliveInternalChildren.removeAt(aliveIndex);
    }

    const childId = child.childId;
    child.childId = 0;
    child.depth = newDepth;
    child.childId = childId;

    this.#internalChildren.add(child);
    if (aliveIndex >= 0) {
      this.#aliveInternalChildren.add(child);
    }

    this.childDepthChanged.emit(child);
  }

  protected indexOfInternal(drawable: Drawable) {
    if (drawable.parent && drawable.parent !== this) {
      throw new Error('Cannot call indexOfInternal for a drawable that already is a child of a different parent.');
    }

    const index = this.#internalChildren.indexOf(drawable);

    if (index >= 0 && this.#internalChildren.get(index)!.childId !== drawable.childId) {
      throw new Error(
        `A non-matching Drawable was returned. Please ensure ${this.name}'s compare function override implements a stable sort algorithm.`,
      );
    }

    return index;
  }

  childDepthChanged = new Action<Drawable>();

  #loadChild(child: Drawable) {
    if (this.isDisposed)
      return;

    loadDrawable(child, this.clock!, this.dependencies);
    child.parent = this;
  }

  protected loadComponent<T extends Drawable>(component: T) {
    this.loadComponents([component]);
  }

  protected loadComponents<T extends Drawable>(components: T[]) {
    if (this.loadState < LoadState.Loading) {
      throw new Error('May not invoke LoadComponentAsync prior to this CompositeDrawable being loaded.');
    }

    if (this.isDisposed) {
      throw new Error('May not invoke LoadComponentAsync on a disposed CompositeDrawable.');
    }

    this.#loadComponents(components, this.dependencies);
  }

  #loadComponents<T extends Drawable>(components: T[], dependencies: DependencyContainer) {
    for (let i = 0; i < components.length; i++) {
      loadDrawable(components[i], this.clock!, dependencies);
    }
  }

  loadComponentAsync<TLoadable extends Drawable>(
    component: TLoadable,
    signal?: AbortSignal,
    scheduler?: Scheduler,
  ): Promise<TLoadable> {
    return this.loadComponentsAsync([component], signal, scheduler).then(([loaded]) => loaded);
  }

  loadComponentsAsync<TLoadable extends Drawable>(
    components: TLoadable[],
    signal?: AbortSignal,
    scheduler?: Scheduler,
  ): Promise<TLoadable[]> {
    if (this.loadState < LoadState.Loading) {
      throw new Error('May not invoke LoadComponentAsync prior to this CompositeDrawable being loaded.');
    }

    if (this.isDisposed) {
      throw new Error('May not invoke LoadComponentAsync on a disposed CompositeDrawable.');
    }

    this.#disposalAbortController ??= new AbortController();

    const linkedAbortController = new AbortController();

    signal?.addEventListener('abort', () => linkedAbortController.abort());
    this.#disposalAbortController.signal.addEventListener('abort', () => linkedAbortController.abort());

    const deps = new DependencyContainer(this.dependencies);
    deps.provide(linkedAbortController.signal);

    this.#loadingComponents ??= new WeakSet<Drawable>();

    const loadables = [...components];

    for (const d of loadables) {
      this.#loadingComponents.add(d);

      d.onLoadComplete.addListener(() => {
        this.#loadingComponents?.delete(d);
      });
    }

    return this.#loadComponentsAsync(loadables, deps, true, linkedAbortController.signal);
  }

  async #loadComponentsAsync<TLoadable extends Drawable>(
    components: TLoadable[],
    dependencies: DependencyContainer,
    isDirectAsyncContext: boolean,
    signal: AbortSignal,
  ): Promise<TLoadable[]> {
    for (let i = 0; i < components.length; i++) {
      if (signal.aborted)
        break;

      if (!(await loadDrawableFromAsync(components[i], this.clock!, dependencies, isDirectAsyncContext))) {
        components.splice(i--, 1);
      }
    }

    return components;
  }

  #disposalAbortController: AbortController | null = null;
  #loadingComponents: WeakSet<Drawable> | null = null;

  override onLoad() {
    for (const child of this.#internalChildren) {
      this.#loadChild(child);
    }
  }

  protected addAllInternal(...children: Drawable[]): this {
    for (const child of children) {
      this.addInternal(child);
    }
    return this;
  }

  protected removeInternal(drawable: Drawable, disposeImmediately: boolean = true): boolean {
    const index = this.#internalChildren.indexOf(drawable);

    if (index < 0) {
      if (disposeImmediately)
        drawable.dispose();
      return false;
    }

    this.#internalChildren.removeAt(index);

    if (drawable.isAlive) {
      const aliveIndex = this.#aliveInternalChildren.indexOf(drawable);
      debugAssert(aliveIndex >= 0, 'Drawable is alive but not in aliveInternalChildren');
      this.#aliveInternalChildren.removeAt(aliveIndex);

      this.childDied.emit(drawable);
    }

    drawable.parent = null;
    drawable.isAlive = false;
    this.drawNode?.removeChild(drawable.drawNode);

    if (this.autoSizeAxes !== Axes.None) {
      this.invalidate(Invalidation.RequiredParentSizeToFit, InvalidationSource.Child);
    }

    if (disposeImmediately)
      drawable.dispose();
    return true;
  }

  protected clearInternal(disposeChildren: boolean = true) {
    if (this.isDisposed || this.#internalChildren.length === 0) {
      return;
    }

    for (const internalChild of this.#internalChildren) {
      if (internalChild.isAlive) {
        this.childDied.emit(internalChild);
      }

      this.drawNode.removeChild(internalChild.drawNode);

      internalChild.isAlive = false;
      internalChild.parent = null;

      if (disposeChildren) {
        this.disposeChildAsync(internalChild);
      }
    }

    this.#internalChildren.clear();
    this.#aliveInternalChildren.clear();

    this.requestsNonPositionalInputSubTree = super.requestsNonPositionalInput;
    this.requestsPositionalInputSubTree = super.requestsPositionalInput;

    if (this.autoSizeAxes !== Axes.None) {
      this.invalidate(Invalidation.RequiredParentSizeToFit, InvalidationSource.Child);
    }
  }

  protected disposeChildAsync(child: Drawable) {
    child.dispose();
    // requestIdleCallback(() => {
    //   child.dispose();
    // });
  }

  get childSize(): Vec2 {
    return this.drawSize.sub(this.padding.total);
  }

  #relativeChildSize = new Vec2(1);

  get relativeChildSize(): Vec2 {
    return this.#relativeChildSize;
  }

  protected set relativeChildSize(value: IVec2) {
    if (this.#relativeChildSize.equals(value))
      return;

    if (!isFinite(value.x) || !isFinite(value.y))
      throw new Error('relativeChildSize must be finite.');
    if (value.x === 0 || value.y === 0)
      throw new Error('relativeChildSize must be non-zero.');

    this.#relativeChildSize = Vec2.from(value);

    for (const c of this.#internalChildren) c.invalidate(c.invalidationFromParentSize);
  }

  get relativeToAbsoluteFactor() {
    return this.childSize.div(this.relativeChildSize);
  }

  override get relativeSizeAxes(): Axes {
    return super.relativeSizeAxes;
  }

  override set relativeSizeAxes(value: Axes) {
    if (value & this.autoSizeAxes) {
      throw new Error('Cannot set relativeSizeAxes to include auto-size axes');
    }
    super.relativeSizeAxes = value;
  }

  override onInvalidate(invalidation: Invalidation, source: InvalidationSource): boolean {
    let anyInvalidated = super.onInvalidate(invalidation, source);

    if (source === InvalidationSource.Child)
      return anyInvalidated;

    if (invalidation === Invalidation.None)
      return anyInvalidated;

    let targetChildren = this.#aliveInternalChildren.items;

    if ((invalidation & ~Invalidation.Layout) > 0) {
      targetChildren = this.#internalChildren.items;
    }

    for (const c of targetChildren) {
      let childInvalidation = invalidation;

      // Other geometry things like rotation, shearing, etc don't affect child properties.
      childInvalidation &= ~Invalidation.Transform;

      if (
        (c.relativePositionAxes !== Axes.None || c.anchor !== Anchor.TopLeft)
        && (invalidation & Invalidation.DrawSize) > 0
      ) {
        childInvalidation |= Invalidation.Transform;
      }

      if (c.relativeSizeAxes === Axes.None) {
        childInvalidation &= ~Invalidation.DrawSize;
      }

      if (c.invalidate(childInvalidation, InvalidationSource.Parent)) {
        anyInvalidated = true;
      }
    }

    return anyInvalidated;
  }

  #padding: MarginPadding = new MarginPadding();

  get padding(): MarginPadding {
    return this.#padding;
  }

  set padding(value: MarginPaddingOptions | undefined) {
    if (this.#padding === value)
      return;

    const padding = MarginPadding.from(value);

    if (this.#padding.equals(padding))
      return;

    this.#padding = padding;

    for (const c of this.#internalChildren) c.invalidate(c.invalidationFromParentSize | Invalidation.Transform);
  }

  get childOffset(): Vec2 {
    return new Vec2(this.padding.left, this.padding.top);
  }

  #autoSizeAxes: Axes = Axes.None;

  get autoSizeAxes(): Axes {
    return this.#autoSizeAxes;
  }

  set autoSizeAxes(value: Axes) {
    if (value === this.#autoSizeAxes)
      return;

    if (value & this.relativeSizeAxes) {
      throw new Error('Cannot set autoSizeAxes to include relative size axes');
    }

    this.#autoSizeAxes = value;

    if (value === Axes.None) {
      this.#childrenSizeDependencies.validate();
    } else {
      this.#childrenSizeDependencies.invalidate();
    }

    this.onSizingChanged();
  }

  autoSizeDuration = 0;

  autoSizeEasing: EasingFunction = EasingFunction.Default;

  #childrenSizeDependencies = new LayoutMember(
    Invalidation.RequiredParentSizeToFit | Invalidation.Presence,
    InvalidationSource.Child,
  );

  invalidateChildrenSizeDependencies(invalidation: Invalidation, axes: Axes, source: Drawable) {
    const wasValid = this.#childrenSizeDependencies.isValid;

    // The invalidation still needs to occur as normal, since a derived CompositeDrawable may want to respond to children size invalidations.
    this.invalidate(invalidation, InvalidationSource.Child);

    // Skip axes that are bypassed.
    axes &= ~source.bypassAutoSizeAxes;

    // Include only axes that this composite is autosizing for.
    axes &= this.autoSizeAxes;

    // If no remaining axes remain, then children size dependencies can immediately be re-validated as the auto-sized size would not change.
    if (wasValid && axes === Axes.None)
      this.#childrenSizeDependencies.validate();
  }

  override updateSubTree(): boolean {
    if (!super.updateSubTree())
      return false;

    if (!this.isPresent)
      return false;

    this.updateChildrenLife();

    this.updateAfterChildrenLife();

    for (const child of this.#aliveInternalChildren.items) {
      child.updateSubTree();
    }

    this.updateAfterChildren();

    this.#updateChildrenSizeDependencies();

    return true;
  }

  override updateSubTreeTransforms(): boolean {
    if (!super.updateSubTreeTransforms())
      return false;

    for (const child of this.#aliveInternalChildren.items) {
      child.updateSubTreeTransforms();
    }
    return true;
  }

  get requiresChildrenUpdate(): boolean {
    /* TODO: replace with !this.isMaskedAway || !this.#childrenSizeDependencies.isValid */
    return true;
  }

  updateAfterChildrenLife() {
  }

  updateAfterChildren() {
  }

  updateChildrenLife(): boolean {
    if (this.loadState < LoadState.Ready)
      return false;

    if (!this.checkChildrenLife())
      return false;

    return true;
  }

  checkChildrenLife(): boolean {
    let anyAliveChanged = false;

    for (let i = 0; i < this.#internalChildren.length; i++) {
      const state = this.#checkChildLife(this.#internalChildren.items[i]);

      anyAliveChanged ||= !!(state & ChildLifeStateChange.MadeAliveOrDead);

      if (state & ChildLifeStateChange.Removed)
        i--;
    }

    return anyAliveChanged;
  }

  #checkChildLife(child: Drawable): ChildLifeStateChange {
    let state = ChildLifeStateChange.None;

    if (child.shouldBeAlive) {
      if (!child.isAlive) {
        if (child.loadState < LoadState.Ready) {
          // If we're already loaded, we can eagerly allow children to be loaded
          this.#loadChild(child);
          if (child.loadState < LoadState.Ready)
            return ChildLifeStateChange.None;
        }

        this.makeChildAlive(child);
        state = ChildLifeStateChange.MadeAlive;
      }
    } else {
      if (child.isAlive || child.removeWhenNotAlive) {
        if (this.makeChildDead(child))
          state |= ChildLifeStateChange.Removed;

        state |= ChildLifeStateChange.MadeDead;
      }
    }

    return state;
  }

  override buildPositionalInputQueue(screenSpacePos: Vec2, queue: List<Drawable>): boolean {
    if (!super.buildPositionalInputQueue(screenSpacePos, queue))
      return false;

    if (!this.receivePositionalInputAtSubTree(screenSpacePos))
      return false;

    for (const child of this.#aliveInternalChildren.items) {
      child.buildPositionalInputQueue(screenSpacePos, queue);
    }

    return true;
  }

  override buildPositionalInputQueueLocal(localPos: Vec2, queue: List<Drawable>): boolean {
    if (!super.buildPositionalInputQueueLocal(localPos, queue))
      return false;

    if (!this.receivePositionalInputAtSubTreeLocal(localPos))
      return false;


    for (const child of this.#aliveInternalChildren.items) {
      child.drawNode.updateLocalTransform();

      const local = child.drawNode.localTransform.applyInverse(localPos, this._tempVec2);

      child.buildPositionalInputQueueLocal(local, queue);

    }

    return true;
  }

  protected receivePositionalInputAtSubTree(screenSpacePos: Vec2): boolean {
    return !this.#masking || this.receivePositionalInputAt(screenSpacePos);
  }

  childrenWillGoOutOfBounds = true;

  protected receivePositionalInputAtSubTreeLocal(localPos: Vec2): boolean {
    return this.childrenWillGoOutOfBounds || this.receivePositionalInputAtLocal(localPos);
  }

  protected shouldBeConsideredForInput(child: Drawable) {
    return child.loadState === LoadState.Loaded;
  }

  override buildNonPositionalInputQueue(queue: List<Drawable>, allowBlocking?: boolean): boolean {
    if (!super.buildNonPositionalInputQueue(queue, allowBlocking))
      return false;

    const children = this.aliveInternalChildren;

    for (const child of children) {
      if (child.loadState === LoadState.Loaded)
        child.buildNonPositionalInputQueue(queue, allowBlocking);
    }

    return true;
  }

  makeChildAlive(child: Drawable) {
    debugAssert(!child.isAlive && child.loadState >= LoadState.Ready);

    if (child.requestsNonPositionalInputSubTree) {
      for (
        let ancestor: CompositeDrawable | null = this;
        ancestor !== null && !ancestor.requestsNonPositionalInputSubTree;
        ancestor = ancestor.parent
      )
        ancestor.requestsNonPositionalInputSubTree = true;
    }

    if (child.requestsPositionalInputSubTree) {
      for (
        let ancestor: CompositeDrawable | null = this;
        ancestor !== null && !ancestor.requestsPositionalInputSubTree;
        ancestor = ancestor.parent
      ) {
        ancestor.requestsPositionalInputSubTree = true;
      }
    }

    this.#aliveInternalChildren.add(child);
    child.isAlive = true;

    this.childBecameAlive.emit(child);

    child.invalidate(Invalidation.Layout, InvalidationSource.Parent);

    this.drawNode.addChild(child.drawNode);

    this.invalidate(Invalidation.Presence, InvalidationSource.Child);
  }

  makeChildDead(child: Drawable): boolean {
    if (child.isAlive) {
      const index = this.aliveInternalChildren.indexOf(child);
      debugAssert(index !== -1, 'Child is alive but not in aliveInternalChildren');
      this.#aliveInternalChildren.removeAt(index);
      child.isAlive = false;

      this.drawNode.removeChild(child.drawNode);

      this.childDied.emit(child);
    }

    let removed = false;

    if (child.removeWhenNotAlive) {
      this.removeInternal(child, false);

      if (child.disposeOnDeathRemoval)
        this.disposeChildAsync(child);

      removed = true;
    }

    this.invalidate(Invalidation.Presence, InvalidationSource.Child);

    return removed;
  }

  #isComputingChildrenSizeDependencies = false;

  override get width() {
    if (!this.#isComputingChildrenSizeDependencies && this.autoSizeAxes & Axes.X)
      this.#updateChildrenSizeDependencies();
    return super.width;
  }

  override set width(value: number) {
    if (this.autoSizeAxes & Axes.X)
      throw new Error('Cannot set width on a CompositeDrawable with autoSizeAxes.X');
    super.width = value;
  }

  override get height() {
    if (!this.#isComputingChildrenSizeDependencies && this.autoSizeAxes & Axes.Y)
      this.#updateChildrenSizeDependencies();
    return super.height;
  }

  override set height(value: number) {
    if (this.autoSizeAxes & Axes.Y)
      throw new Error('Cannot set height on a CompositeDrawable with autoSizeAxes.Y');
    super.height = value;
  }

  override get size(): Vec2 {
    if (!this.#isComputingChildrenSizeDependencies && this.autoSizeAxes !== Axes.None)
      this.#updateChildrenSizeDependencies();
    return super.size;
  }

  override set size(value: IVec2) {
    if (this.autoSizeAxes & Axes.Both)
      throw new Error('Cannot set size on a CompositeDrawable with autoSizeAxes');
    super.size = value;
  }

  #computeAutoSize() {

    if (this.autoSizeAxes === Axes.None)
      return this.drawSize;

    const maxBoundSize = new Vec2();

    // this.padding = 0;
    // this.margin = 0;

    for (const c of this.#aliveInternalChildren.items) {
      if (!c.isPresent)
        continue;

      const cBound = c.requiredParentSizeToFit;

      if (!(c.bypassAutoSizeAxes & Axes.X))
        maxBoundSize.x = Math.max(maxBoundSize.x, cBound.x - this.padding.left);

      if (!(c.bypassAutoSizeAxes & Axes.Y))
        maxBoundSize.y = Math.max(maxBoundSize.y, cBound.y - this.padding.top);
    }

    if (!(this.autoSizeAxes & Axes.X))
      maxBoundSize.x = this.drawSize.x;
    if (!(this.autoSizeAxes & Axes.Y))
      maxBoundSize.y = this.drawSize.y;

    return maxBoundSize;
  }

  #updateAutoSize() {
    if (this.autoSizeAxes === Axes.None)
      return;

    const b = this.#computeAutoSize().add(this.padding.total);

    this.#autoSizeResizeTo(
      {
        x: this.autoSizeAxes & Axes.X ? b.x : super.width,
        y: this.autoSizeAxes & Axes.Y ? b.y : super.height,
      },
      this.autoSizeDuration,
      this.autoSizeEasing,
    );

    // TODO: onAutoSize?.emit();
  }

  #updateChildrenSizeDependencies() {
    if (!this.#childrenSizeDependencies.isValid) {
      this.#isComputingChildrenSizeDependencies = true;

      this.#updateAutoSize();
      this.#childrenSizeDependencies.validate();
      this.#isComputingChildrenSizeDependencies = false;
    }
  }

  #autoSizeResizeTo(size: IVec2, duration: number, easing: EasingFunction) {
    if (this.autoSizeAxes & Axes.X)
      this.clearTransforms(false, 'width');
    if (this.autoSizeAxes & Axes.Y)
      this.clearTransforms(false, 'height');
    if (this.autoSizeAxes & Axes.Both)
      this.clearTransforms(false, 'size');

    if (duration === 0) {
      this.baseWidth = size.x;
      this.baseHeight = size.y;
    } else {
      this.transformTo('baseWidth', size.x, duration, easing);
      this.transformTo('baseHeight', size.y, duration, easing);
    }
  }

  get baseWidth() {
    return super.width;
  }

  set baseWidth(value: number) {
    super.width = value;
  }

  get baseHeight() {
    return super.height;
  }

  set baseHeight(value: number) {
    super.height = value;
  }

  get masking(): boolean {
    return this.#masking;
  }

  set masking(value: boolean) {
    if (this.#masking === value)
      return;

    this.#masking = value;
    this.#updateMasking();
  }

  #masking = false;
  #maskingContainer: PIXIGraphics | null = null;

  #updateMasking() {
    if (this.#masking && !this.#maskingContainer) {
      this.#maskingContainer = new PIXIGraphics().rect(0, 0, 1, 1).fill({ color: 0xFFFFFF });

      this.drawNode.addChild(this.#maskingContainer);
      this.drawNode.mask = this.#maskingContainer;
    } else if (!this.#masking && this.#maskingContainer) {
      this.drawNode.removeChild(this.#maskingContainer)?.destroy();
      this.drawNode.mask = null;

      this.#maskingContainer = null;
    }
  }

  override updateDrawNodeTransform(): void {
    super.updateDrawNodeTransform();

    this.#maskingContainer?.scale.copyFrom(this.drawSize);
  }

  override dispose(isDisposing: boolean = true) {
    this.#disposalAbortController?.abort();
    this.#internalChildren.items.forEach(c => c.dispose());

    super.dispose(isDisposing);
  }

  override applyTransformsAt(time: number, propagateChildren: boolean = false) {
    super.applyTransformsAt(time, propagateChildren);
    if (!propagateChildren) {
      return;
    }

    for (const child of this.#internalChildren) {
      child.applyTransformsAt(time, true);
    }
  }

  override finishTransforms(propagateChildren: boolean = false, targetMember?: string) {
    super.finishTransforms(propagateChildren, targetMember);
    if (!propagateChildren) {
      return;
    }

    for (const child of this.#internalChildren) {
      child.finishTransforms(true);
    }
  }

  override clearTransformsAfter(time: number, propagateChildren: boolean = false, targetMember?: string) {
    super.clearTransformsAfter(time, propagateChildren, targetMember);
    if (this.autoSizeAxes !== 0 && this.autoSizeDuration > 0) {
      this.#childrenSizeDependencies.invalidate();
    }

    if (!propagateChildren) {
      return;
    }

    for (const child of this.#internalChildren) {
      child.clearTransformsAfter(time, true, targetMember);
    }
  }

  override addDelay(duration: number, propagateChildren: boolean = false) {
    if (duration === 0) {
      return;
    }

    super.addDelay(duration, propagateChildren);
    if (!propagateChildren) {
      return;
    }

    for (const child of this.#internalChildren) {
      child.addDelay(duration, true);
    }
  }

  override beginAbsoluteSequence(newTransformStartTime: number, recursive: boolean = true): IUsable {
    if (!recursive || this.#internalChildren.length === 0) {
      return super.beginAbsoluteSequence(newTransformStartTime, false);
    }

    const absoluteSequenceActions = new List<AbsoluteSequenceSender>(this.#internalChildren.length + 1);

    super.collectAbsoluteSequenceActionsFromSubTree(newTransformStartTime, absoluteSequenceActions);
    for (const c of this.#internalChildren)
      c.collectAbsoluteSequenceActionsFromSubTree(newTransformStartTime, absoluteSequenceActions);

    return new ValueInvokeOnDisposal(() => {
      for (const a of absoluteSequenceActions) {
        a.dispose();
      }
    });
  }

  override get removeCompletedTransforms() {
    return super.removeCompletedTransforms;
  }

  override set removeCompletedTransforms(value) {
    if (this.removeCompletedTransforms === value)
      return;

    super.removeCompletedTransforms = value;
    for (const child of this.#internalChildren.items) {
      child.removeCompletedTransforms = value;
    }
  }

  override collectAbsoluteSequenceActionsFromSubTree(
    newTransformStartTime: number,
    actions: List<AbsoluteSequenceSender>,
  ) {
    super.collectAbsoluteSequenceActionsFromSubTree(newTransformStartTime, actions);

    for (const child of this.#internalChildren)
      child.collectAbsoluteSequenceActionsFromSubTree(newTransformStartTime, actions);
  }
}

const enum ChildLifeStateChange {
  None = 0,
  MadeAlive = 1 << 0,
  MadeDead = 1 << 1,
  Removed = 1 << 2,

  MadeAliveOrDead = MadeAlive | MadeDead,
}
