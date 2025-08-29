import type { ColorSource, Graphics as PIXIGraphics } from "pixi.js";
import { Color, Container as PIXIContainer } from "pixi.js";
import { Action } from "../../bindables/Action";
import type { ReadonlyDependencyContainer } from "../../di";
import { DependencyContainer } from "../../di";
import { type IVec2, Vec2 } from "../../math/Vec2";
import { MaskingEffect } from "../../renderers/MaskingEffect";
import { Scheduler } from "../../scheduling/Scheduler";
import { type IUsable, ValueInvokeOnDisposal } from "../../types/IUsable";
import { debugAssert } from "../../utils/debugAssert";
import type { IComparer } from "../../utils/IComparer";
import { List } from "../../utils/List";
import { SortedList } from "../../utils/SortedList";
import { Anchor } from "../drawables";
import { Axes } from "../drawables/Axes";
import { Drawable, type DrawableOptions, Invalidation, InvalidationSource, loadDrawable, loadDrawableFromAsync, LoadState } from "../drawables/Drawable";
import { LayoutMember } from "../drawables/LayoutMember";
import { MarginPadding, type MarginPaddingOptions } from "../drawables/MarginPadding";
import type { AbsoluteSequenceSender } from "../transforms/AbsoluteSequenceSender";
import { EasingFunction } from "../transforms/EasingFunction";
import type { IFrameBasedClock } from "../../timing";
import type { ProviderMetadata } from "../../di/decorators";
import { metadataKey } from "../../di/decorators";
import { providersKey } from "../../di/decorators";

export interface CompositeDrawableOptions extends DrawableOptions
{
  padding?: MarginPaddingOptions;
  autoSizeAxes?: Axes;
  autoSizeDuration?: number;
  autoSizeEasing?: EasingFunction;
  masking?: boolean;
  cornerRadius?: number;
  cornerExponent?: number;
  borderThickness?: number;
  borderColor?: ColorSource;
}

export class ChildComparer implements IComparer<Drawable>
{
  public constructor(private readonly owner: CompositeDrawable)
  {
  }

  public compare = (a: Drawable, b: Drawable) =>
  {
    return this.owner.compare(a, b);
  };

  public compareDrawNodes = (a: PIXIContainer, b: PIXIContainer) =>
  {
    return this.owner.compare(
        (a as any).drawable,
        (b as any).drawable,
    );
  };
}

export abstract class CompositeDrawable extends Drawable
{
  public readonly [providersKey]: ProviderMetadata[] = [];

  public constructor()
  {
    super();

    this.#childComparer = new ChildComparer(this);

    this.#internalChildren = new SortedList<Drawable>(this.#childComparer);
    this.#aliveInternalChildren = new SortedList<Drawable>(this.#childComparer);

    this.addLayout(this.#childrenSizeDependencies);
  }

  readonly #childComparer: ChildComparer;

  protected override createDrawNode(): PIXIContainer
  {
    return new PIXIContainer();
  }

  #maskingEffect?: MaskingEffect;

  #cornerRadius = 0;

  public get cornerRadius()
  {
    return this.#cornerRadius;
  }

  public set cornerRadius(value)
  {
    if (value < 0)
      value = 0;

    if (this.#cornerRadius === value)
      return;

    this.#cornerRadius = value;
    if (this.#maskingEffect)
      this.#maskingEffect.cornerRadius = value;
  }

  #cornerExponent = 2;

  public get cornerExponent()
  {
    return this.#cornerExponent;
  }

  public set cornerExponent(value)
  {
    if (value < 0)
      value = 0;

    if (this.#cornerExponent === value)
      return;

    this.#cornerExponent = value;
    if (this.#maskingEffect)
      this.#maskingEffect.cornerExponent = value;
  }

  #borderThickness = 0;

  public get borderThickness()
  {
    return this.#borderThickness;
  }

  public set borderThickness(value)
  {
    this.#borderThickness = value;
    if (!this.#maskingEffect)
      throw new Error("Cannot set borderThickness without enabling masking");

    this.#maskingEffect.borderThickness = value;
  }

  #borderColor = new Color("transparent");

  public get borderColor(): Color
  {
    return this.#borderColor;
  }

  public set borderColor(value: ColorSource)
  {
    if (!this.#maskingEffect)
      throw new Error("Cannot set borderRadius without enabling masking");

    this.#borderColor.setValue(value);

    this.#maskingEffect.borderColor = this.#borderColor;
  }

  public readonly childBecameAlive = new Action<Drawable>();

  public readonly childDied = new Action<Drawable>();

  readonly #internalChildren: SortedList<Drawable>;

  #aliveInternalChildren: SortedList<Drawable>;

  public get internalChildren(): ReadonlyArray<Drawable>
  {
    return this.#internalChildren.items;
  }

  protected set internalChildren(value)
  {
    this.clearInternal();
    this.addAllInternal(...value);
  }

  public get internalChild(): Drawable
  {
    if (this.internalChildren.length !== 1)
    {
      throw new Error(
          `Cannot call internalChild unless there's exactly one Drawable in internalChildren (currently ${this.internalChildren.length})!`,
      );
    }

    return this.internalChildren[0];
  }

  protected set internalChild(value: Drawable)
  {
    if (this.isDisposed)
      return;

    this.clearInternal();
    this.addInternal(value);
  }

  public get aliveInternalChildren(): ReadonlyArray<Drawable>
  {
    return this.#aliveInternalChildren.items;
  }

  #currentChildId = 0;

  public override with(options: CompositeDrawableOptions)
  {
    return super.with(options);
  }

  protected addInternal<T extends Drawable>(drawable: T)
  {
    if (this.isDisposed)
    {
      return;
    }

    if (drawable.childId !== 0)
    {
      throw new Error("May not add a drawable to multiple containers.");
    }

    drawable.childId = ++this.#currentChildId;
    drawable.removeCompletedTransforms = this.removeCompletedTransforms;

    if (this.loadState >= LoadState.Loading)
    {
      if (drawable.loadState >= LoadState.Ready)
      {
        drawable.parent = this;
      }
      else
      {
        this.#loadChild(drawable);
      }
    }

    this.#internalChildren.add(drawable);

    if (this.autoSizeAxes !== Axes.None)
      this.invalidate(Invalidation.RequiredParentSizeToFit, InvalidationSource.Child);

    return drawable;
  }

  public compare(a: Drawable, b: Drawable)
  {
    const i = b.depth - a.depth;
    if (i !== 0)
      return i;

    return a.childId - b.childId;
  }

  #childDepthChanged = false;

  protected changeInternalChildDepth(child: Drawable, newDepth: number)
  {
    if (child.depth === newDepth)
      return;

    const index = this.indexOfInternal(child);
    if (index < 0)
      throw new Error("Can not change depth of drawable which is not contained within this CompositeDrawable.");

    this.#internalChildren.removeAt(index);
    const aliveIndex = this.#aliveInternalChildren.indexOf(child);
    if (aliveIndex >= 0)
      this.#aliveInternalChildren.removeAt(aliveIndex);

    const childId = child.childId;
    child.childId = 0;
    child.depth = newDepth;
    child.childId = childId;

    this.#internalChildren.add(child);
    if (aliveIndex >= 0)
      this.#aliveInternalChildren.add(child);

    this.#childDepthChanged = true;

    this.childDepthChanged.emit(child);
  }

  protected indexOfInternal(drawable: Drawable)
  {
    if (drawable.parent && drawable.parent !== this)
    {
      throw new Error("Cannot call indexOfInternal for a drawable that already is a child of a different parent.");
    }

    const index = this.#internalChildren.indexOf(drawable);

    if (index >= 0 && this.#internalChildren.get(index)!.childId !== drawable.childId)
    {
      throw new Error(
          `A non-matching Drawable was returned. Please ensure ${this.typeName}'s compare function override implements a stable sort algorithm.`,
      );
    }

    return index;
  }

  public readonly childDepthChanged = new Action<Drawable>();

  readonly #childrenLoadPromises: Promise<any>[] = [];

  #loadChild(child: Drawable)
  {
    if (this.isDisposed)
      return;
    if (this.isLoadingFromAsync)
      this.#childrenLoadPromises.push(loadDrawableFromAsync(child, this.clock!, this.dependencies, true));
    else
      loadDrawable(child, this.clock!, this.dependencies);
    child.parent = this;
  }

  protected override get hasAsyncLoader(): boolean
  {
    return this.#childrenLoadPromises.length > 0;
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void>
  {
    await super.loadAsync(dependencies);

    await Promise.all(this.#childrenLoadPromises);
  }

  protected loadComponent<T extends Drawable>(component: T)
  {
    this.loadComponents([component]);
  }

  protected loadComponents<T extends Drawable>(components: T[])
  {
    if (this.loadState < LoadState.Loading)
    {
      throw new Error("May not invoke LoadComponentAsync prior to this CompositeDrawable being loaded.");
    }

    if (this.isDisposed)
    {
      throw new Error("May not invoke LoadComponentAsync on a disposed CompositeDrawable.");
    }

    this.#loadComponents(components, this.dependencies);
  }

  #loadComponents<T extends Drawable>(components: T[], dependencies: ReadonlyDependencyContainer)
  {
    for (let i = 0; i < components.length; i++)
    {
      loadDrawable(components[i], this.clock!, dependencies);
    }
  }

  public async loadComponentAsync<TLoadable extends Drawable>(
    component: TLoadable,
    signal?: AbortSignal,
    scheduler?: Scheduler,
  ): Promise<TLoadable>
  {
    const [loaded] = await this.loadComponentsAsync([component], signal, scheduler);

    return loaded;
  }

  public loadComponentsAsync<TLoadable extends Drawable>(
    components: TLoadable[],
    signal?: AbortSignal,
    scheduler?: Scheduler,
  ): Promise<TLoadable[]>
  {
    if (this.loadState < LoadState.Loading)
    {
      throw new Error("May not invoke LoadComponentAsync prior to this CompositeDrawable being loaded.");
    }

    if (this.isDisposed)
    {
      throw new Error("May not invoke LoadComponentAsync on a disposed CompositeDrawable.");
    }

    this.#disposalAbortController ??= new AbortController();

    const linkedAbortController = new AbortController();

    signal?.addEventListener("abort", () => linkedAbortController.abort());
    this.#disposalAbortController.signal.addEventListener("abort", () => linkedAbortController.abort());

    const deps = new DependencyContainer(this.dependencies);
    deps.provide(linkedAbortController.signal);

    this.#loadingComponents ??= new WeakSet<Drawable>();

    const loadables = [...components];

    for (const d of loadables)
    {
      this.#loadingComponents.add(d);

      d.onLoadComplete.addListener(() =>
      {
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
  ): Promise<TLoadable[]>
  {
    for (let i = 0; i < components.length; i++)
    {
      if (signal.aborted)
        break;

      if (!(await loadDrawableFromAsync(components[i], this.clock!, dependencies, isDirectAsyncContext)))
      {
        components.splice(i--, 1);
      }
    }

    return components;
  }

  #disposalAbortController: AbortController | null = null;
  #loadingComponents: WeakSet<Drawable> | null = null;

  protected override onLoad()
  {
    const children = this.#internalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
      this.#loadChild(children[i]);
  }

  protected addRangeInternal(children: Drawable[]): this
  {
    for (let i = 0, len = children.length; i < len; i++)
      this.addInternal(children[i]);

    return this;
  }

  protected addAllInternal(...children: Drawable[]): this
  {
    return this.addRangeInternal(children);
  }

  protected removeInternal(drawable: Drawable, disposeImmediately: boolean = true): boolean
  {
    const index = this.#internalChildren.items.indexOf(drawable);

    if (index < 0)
    {
      if (disposeImmediately)
        drawable.dispose();
      return false;
    }

    this.#internalChildren.removeAt(index);

    if (drawable.isAlive)
    {
      const aliveIndex = this.#aliveInternalChildren.items.indexOf(drawable);
      debugAssert(aliveIndex >= 0, "Drawable is alive but not in aliveInternalChildren");
      this.#aliveInternalChildren.removeAt(aliveIndex);

      this.childDied.emit(drawable);
    }

    drawable.parent = null;
    drawable.isAlive = false;
    this.drawNode?.removeChild(drawable.drawNode);

    if (this.autoSizeAxes !== Axes.None)
    {
      this.invalidate(Invalidation.RequiredParentSizeToFit, InvalidationSource.Child);
    }

    if (disposeImmediately)
      drawable.dispose();
    return true;
  }

  protected clearInternal(disposeChildren: boolean = true)
  {
    if (this.isDisposed || this.#internalChildren.length === 0)
    {
      return;
    }

    const children = this.#internalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
    {
      const internalChild = children[i];

      if (internalChild.isAlive)
      {
        this.childDied.emit(internalChild);
      }

      this.drawNode.removeChild(internalChild.drawNode);

      internalChild.isAlive = false;
      internalChild.parent = null;

      if (disposeChildren)
      {
        this.disposeChildAsync(internalChild);
      }
    }

    this.#internalChildren.clear();
    this.#aliveInternalChildren.clear();

    this.requestsNonPositionalInputSubTree = super.requestsNonPositionalInput;
    this.requestsPositionalInputSubTree = super.requestsPositionalInput;

    if (this.autoSizeAxes !== Axes.None)
    {
      this.invalidate(Invalidation.RequiredParentSizeToFit, InvalidationSource.Child);
    }
  }

  protected disposeChildAsync(child: Drawable)
  {
    child.dispose();
    // requestIdleCallback(() => {
    //   child.dispose();
    // });
  }

  public get childSize(): Vec2
  {
    return this.drawSize.sub(this.padding.total);
  }

  #relativeChildSize = new Vec2(1);

  public get relativeChildSize(): Vec2
  {
    return this.#relativeChildSize;
  }

  public set relativeChildSize(value: IVec2)
  {
    if (this.#relativeChildSize.equals(value))
      return;

    if (!Number.isFinite(value.x) || !Number.isFinite(value.y))
      throw new Error("relativeChildSize must be finite.");
    if (value.x === 0 || value.y === 0)
      throw new Error("relativeChildSize must be non-zero.");

    this.#relativeChildSize = Vec2.from(value);

    const children = this.#internalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
    {
      const child = children[i];
      child.invalidate(child.invalidationFromParentSize);
    }
  }

  public get relativeToAbsoluteFactor()
  {
    return this.childSize.div(this.#relativeChildSize);
  }

  public override get relativeSizeAxes(): Axes
  {
    return super.relativeSizeAxes;
  }

  public override set relativeSizeAxes(value: Axes)
  {
    if (value & this.autoSizeAxes)
      throw new Error("Cannot set relativeSizeAxes to include auto-size axes");

    super.relativeSizeAxes = value;
  }

  protected override onInvalidate(invalidation: Invalidation, source: InvalidationSource): boolean
  {
    let anyInvalidated = super.onInvalidate(invalidation, source);

    if (source === InvalidationSource.Child)
      return anyInvalidated;

    if (invalidation === Invalidation.None)
      return anyInvalidated;

    let targetChildren = this.#aliveInternalChildren.items;

    if ((invalidation & ~Invalidation.Layout) > 0)
    {
      targetChildren = this.#internalChildren.items;
    }

    for (let i = 0, len = targetChildren.length; i < len; i++)
    {
      const c = targetChildren[i];

      let childInvalidation = invalidation;

      // Other geometry things like rotation, shearing, etc don't affect child properties.
      childInvalidation &= ~Invalidation.Transform;

      if (
        (c.relativePositionAxes !== Axes.None || c.anchor !== Anchor.TopLeft)
        && (invalidation & Invalidation.DrawSize) > 0
      )
      {
        childInvalidation |= Invalidation.Transform;
      }

      if (c.relativeSizeAxes === Axes.None)
      {
        childInvalidation &= ~Invalidation.DrawSize;
      }

      if (c.invalidate(childInvalidation, InvalidationSource.Parent))
      {
        anyInvalidated = true;
      }
    }

    return anyInvalidated;
  }

  #padding: MarginPadding = new MarginPadding();

  public get padding(): MarginPadding
  {
    return this.#padding;
  }

  public set padding(value: MarginPaddingOptions | undefined)
  {
    if (this.#padding === value)
      return;

    const padding = MarginPadding.from(value);

    if (this.#padding.equals(padding))
      return;

    this.#padding = padding;

    const children = this.#internalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
    {
      const c = children[i];
      c.invalidate(c.invalidationFromParentSize | Invalidation.Transform);
    }
  }

  public get childOffset(): Vec2
  {
    return new Vec2(this.padding.left, this.padding.top);
  }

  #autoSizeAxes: Axes = Axes.None;

  public get autoSizeAxes(): Axes
  {
    return this.#autoSizeAxes;
  }

  public set autoSizeAxes(value: Axes)
  {
    if (value === this.#autoSizeAxes)
      return;

    if (value & this.relativeSizeAxes)
    {
      throw new Error("Cannot set autoSizeAxes to include relative size axes");
    }

    this.#autoSizeAxes = value;

    if (value === Axes.None)
    {
      this.#childrenSizeDependencies.validate();
    }
    else
    {
      this.#childrenSizeDependencies.invalidate();
    }

    this.onSizingChanged();
  }

  public autoSizeDuration = 0;

  public autoSizeEasing: EasingFunction = EasingFunction.Default;

  #childrenSizeDependencies = new LayoutMember(
      Invalidation.RequiredParentSizeToFit | Invalidation.Presence,
      InvalidationSource.Child,
  );

  public invalidateChildrenSizeDependencies(invalidation: Invalidation, axes: Axes, source: Drawable)
  {
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

  #schedulerAfterChildren: Scheduler | null = null;

  protected get schedulerAfterChildren(): Scheduler
  {
    if (this.#schedulerAfterChildren)
    {
      return this.#schedulerAfterChildren;
    }

    this.#schedulerAfterChildren = new Scheduler(this.clock);
    return this.#schedulerAfterChildren;
  }

  public override updateSubTree(): boolean
  {
    if (!super.updateSubTree())
      return false;

    if (!this.isPresent)
      return false;

    this.updateChildrenLife();

    this.updateAfterChildrenLife();

    const children = this.#aliveInternalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
      children[i].updateSubTree();

    this.#schedulerAfterChildren?.update();

    this.updateAfterChildren();

    this.#updateChildrenSizeDependencies();

    return true;
  }

  public override updateClock(clock: IFrameBasedClock)
  {
    if (clock === this.clock)
      return;

    super.updateClock(clock);
    for (const child of this.#internalChildren)
      child.updateClock(clock);

    this.#schedulerAfterChildren?.updateClock(clock);
  }

  public override updateSubTreeTransforms(): boolean
  {
    if (!super.updateSubTreeTransforms())
      return false;

    if (this.#childDepthChanged)
    {
      this.drawNode!.children.sort(this.#childComparer.compareDrawNodes);
      this.#childDepthChanged = false;
    }

    const children = this.#aliveInternalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
      children[i].updateSubTreeTransforms();

    return true;
  }

  protected get requiresChildrenUpdate(): boolean
  {
    /* TODO: replace with !this.isMaskedAway || !this.#childrenSizeDependencies.isValid */
    return true;
  }

  protected updateAfterChildrenLife()
  {
  }

  protected updateAfterChildren()
  {
  }

  protected createChildDependencies(parentDependencies: ReadonlyDependencyContainer): ReadonlyDependencyContainer
  {
    return parentDependencies;
  }

  #dependencies!: ReadonlyDependencyContainer;

  public override get dependencies()
  {
    return this.#dependencies;
  }

  protected override injectDependencies(dependencies: ReadonlyDependencyContainer)
  {
    dependencies = this.createChildDependencies(dependencies);

    let childDependencies: DependencyContainer | undefined = undefined;

    const selfProviders: ProviderMetadata[] | undefined = (this.constructor as any)[metadataKey]?.[providersKey];

    if (selfProviders?.length)
    {
      childDependencies ??= new DependencyContainer(dependencies);

      for (const { type } of selfProviders)
      {
        if (type)
          childDependencies.provide(type, this);
        else
          childDependencies.provide(this);
      }
    }

    const providers = this[providersKey];
    if (providers.length > 0)
    {
      childDependencies ??= new DependencyContainer(dependencies);

      for (const { get, type } of providers)
      {
        const value = get.call(this);

        if (type)
          childDependencies.provide(type, value);
        else
          childDependencies.provide(value);
      }
    }

    this.#dependencies = childDependencies ?? dependencies;

    super.injectDependencies(dependencies);
  }

  protected updateChildrenLife(): boolean
  {
    if (this.loadState < LoadState.Ready)
      return false;

    if (!this.checkChildrenLife())
      return false;

    return true;
  }

  protected checkChildrenLife(): boolean
  {
    let anyAliveChanged = 0;

    const children = this.#internalChildren.items;
    for (let i = 0; i < children.length; i++)
    {
      const state = this.#checkChildLife(children[i]);

      anyAliveChanged |= state & ChildLifeStateChange.MadeAliveOrDead;

      if (state & ChildLifeStateChange.Removed)
        i--;
    }

    return !!anyAliveChanged;
  }

  #checkChildLife(child: Drawable): ChildLifeStateChange
  {
    let state = ChildLifeStateChange.None;

    if (child.shouldBeAlive)
    {
      if (!child.isAlive)
      {
        if (child.loadState < LoadState.Ready)
        {
          // If we're already loaded, we can eagerly allow children to be loaded
          this.#loadChild(child);
          if (child.loadState < LoadState.Ready)
            return ChildLifeStateChange.None;
        }

        this.makeChildAlive(child);
        state = ChildLifeStateChange.MadeAlive;
      }
    }
    else
    {
      if (child.isAlive || child.removeWhenNotAlive)
      {
        if (this.makeChildDead(child))
          state |= ChildLifeStateChange.Removed;

        state |= ChildLifeStateChange.MadeDead;
      }
    }

    return state;
  }

  public override buildPositionalInputQueue(screenSpacePos: Vec2, queue: List<Drawable>): boolean
  {
    if (!super.buildPositionalInputQueue(screenSpacePos, queue))
      return false;

    if (!this.receivePositionalInputAtSubTree(screenSpacePos))
      return false;

    const children = this.#aliveInternalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
      children[i].buildPositionalInputQueue(screenSpacePos, queue);

    return true;
  }

  public override buildPositionalInputQueueLocal(localPos: Vec2, queue: List<Drawable>): boolean
  {
    if (!super.buildPositionalInputQueueLocal(localPos, queue))
      return false;

    if (!this.receivePositionalInputAtSubTreeLocal(localPos))
      return false;

    const children = this.#aliveInternalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
    {
      const child = children[i];

      child.drawNode.updateLocalTransform();

      const local = child.drawNode.localTransform.applyInverse(localPos, this._tempVec2);

      child.buildPositionalInputQueueLocal(local, queue);
    }

    return true;
  }

  protected receivePositionalInputAtSubTree(screenSpacePos: Vec2): boolean
  {
    return !this.#masking || this.receivePositionalInputAt(screenSpacePos);
  }

  public childrenWillGoOutOfBounds = true;

  protected receivePositionalInputAtSubTreeLocal(localPos: Vec2): boolean
  {
    return this.childrenWillGoOutOfBounds || this.receivePositionalInputAtLocal(localPos);
  }

  protected shouldBeConsideredForInput(child: Drawable)
  {
    return child.loadState === LoadState.Loaded;
  }

  public override buildNonPositionalInputQueue(queue: List<Drawable>, allowBlocking?: boolean): boolean
  {
    if (!super.buildNonPositionalInputQueue(queue, allowBlocking))
      return false;

    const children = this.aliveInternalChildren;

    for (let i = 0, len = children.length; i < len; i++)
    {
      const child = children[i];
      if (child.loadState === LoadState.Loaded)
        child.buildNonPositionalInputQueue(queue, allowBlocking);
    }

    return true;
  }

  protected makeChildAlive(child: Drawable)
  {
    debugAssert(!child.isAlive && child.loadState >= LoadState.Ready);

    if (child.requestsNonPositionalInputSubTree)
    {
      for (
        let ancestor: CompositeDrawable | null = this;
        ancestor !== null && !ancestor.requestsNonPositionalInputSubTree;
        ancestor = ancestor.parent
      )
        ancestor.requestsNonPositionalInputSubTree = true;
    }

    if (child.requestsPositionalInputSubTree)
    {
      for (
        let ancestor: CompositeDrawable | null = this;
        ancestor !== null && !ancestor.requestsPositionalInputSubTree;
        ancestor = ancestor.parent
      )
      {
        ancestor.requestsPositionalInputSubTree = true;
      }
    }

    this.#aliveInternalChildren.add(child);
    child.isAlive = true;

    this.#childDepthChanged = true;
    this.childBecameAlive.emit(child);

    child.invalidate(Invalidation.Layout, InvalidationSource.Parent);

    this.drawNode.addChild(child.drawNode);

    this.invalidate(Invalidation.Presence, InvalidationSource.Child);
  }

  protected makeChildDead(child: Drawable): boolean
  {
    if (child.isAlive)
    {
      const index = this.aliveInternalChildren.indexOf(child);
      debugAssert(index !== -1, "Child is alive but not in aliveInternalChildren");
      this.#aliveInternalChildren.removeAt(index);
      child.isAlive = false;

      this.drawNode.removeChild(child.drawNode);

      this.childDied.emit(child);
    }

    let removed = false;

    if (child.removeWhenNotAlive)
    {
      this.removeInternal(child, false);

      if (child.disposeOnDeathRemoval)
        this.disposeChildAsync(child);

      removed = true;
    }

    this.invalidate(Invalidation.Presence, InvalidationSource.Child);

    return removed;
  }

  #isComputingChildrenSizeDependencies = false;

  public override get width()
  {
    if (!this.#isComputingChildrenSizeDependencies && this.autoSizeAxes & Axes.X)
      this.#updateChildrenSizeDependencies();
    return super.width;
  }

  public override set width(value: number)
  {
    if (this.autoSizeAxes & Axes.X)
      throw new Error("Cannot set width on a CompositeDrawable with autoSizeAxes.X");
    super.width = value;
  }

  public override get height()
  {
    if (!this.#isComputingChildrenSizeDependencies && this.autoSizeAxes & Axes.Y)
      this.#updateChildrenSizeDependencies();
    return super.height;
  }

  public override set height(value: number)
  {
    if (this.autoSizeAxes & Axes.Y)
      throw new Error("Cannot set height on a CompositeDrawable with autoSizeAxes.Y");
    super.height = value;
  }

  public override get size(): Vec2
  {
    if (!this.#isComputingChildrenSizeDependencies && this.autoSizeAxes !== Axes.None)
      this.#updateChildrenSizeDependencies();
    return super.size;
  }

  public override set size(value: IVec2)
  {
    if (this.autoSizeAxes & Axes.Both)
      throw new Error("Cannot set size on a CompositeDrawable with autoSizeAxes");
    super.size = value;
  }

  #computeAutoSize()
  {
    if (this.autoSizeAxes === Axes.None)
      return this.drawSize;

    const maxBoundSize = new Vec2();

    // this.padding = 0;
    // this.margin = 0;

    const children = this.#aliveInternalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
    {
      const child = children[i];

      if (!child.isPresent)
        continue;

      const cBound = child.requiredParentSizeToFit;

      if (!(child.bypassAutoSizeAxes & Axes.X))
        maxBoundSize.x = Math.max(maxBoundSize.x, cBound.x - this.padding.left);

      if (!(child.bypassAutoSizeAxes & Axes.Y))
        maxBoundSize.y = Math.max(maxBoundSize.y, cBound.y - this.padding.top);
    }

    if (!(this.autoSizeAxes & Axes.X))
      maxBoundSize.x = this.drawSize.x;
    if (!(this.autoSizeAxes & Axes.Y))
      maxBoundSize.y = this.drawSize.y;

    return maxBoundSize;
  }

  #updateAutoSize()
  {
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

  #updateChildrenSizeDependencies()
  {
    if (!this.#childrenSizeDependencies.isValid)
    {
      this.#isComputingChildrenSizeDependencies = true;

      this.#updateAutoSize();
      this.#childrenSizeDependencies.validate();
      this.#isComputingChildrenSizeDependencies = false;
    }
  }

  #autoSizeResizeTo(size: IVec2, duration: number, easing: EasingFunction)
  {
    if (this.autoSizeAxes & Axes.X)
      this.clearTransforms(false, "width");
    if (this.autoSizeAxes & Axes.Y)
      this.clearTransforms(false, "height");
    if (this.autoSizeAxes & Axes.Both)
      this.clearTransforms(false, "size");

    if (duration === 0)
    {
      this.baseWidth = size.x;
      this.baseHeight = size.y;
    }
    else
    {
      this.transformTo("baseWidth", size.x, duration, easing);
      this.transformTo("baseHeight", size.y, duration, easing);
    }
  }

  /**
   * @internal
   */
  public get baseWidth()
  {
    return super.width;
  }

  /**
   * @internal
   */
  public set baseWidth(value: number)
  {
    super.width = value;
  }

  /**
   * @internal
   */
  public get baseHeight()
  {
    return super.height;
  }

  /**
   * @internal
   */
  public set baseHeight(value: number)
  {
    super.height = value;
  }

  public get masking(): boolean
  {
    return this.#masking;
  }

  public set masking(value: boolean)
  {
    if (this.#masking === value)
      return;

    this.#masking = value;

    if (value && !this.#maskingEffect)
    {
      this.drawNode.addEffect(this.#maskingEffect = new MaskingEffect(this));
    }
    else if (!value && this.#maskingEffect)
    {
      this.drawNode.removeEffect(this.#maskingEffect);
      this.#maskingEffect = undefined;
    }
  }

  #masking = false;
  #maskingContainer: PIXIGraphics | null = null;

  protected override updateDrawNodeTransform(): void
  {
    super.updateDrawNodeTransform();

    this.#maskingContainer?.scale.copyFrom(this.drawSize);
  }

  public override dispose()
  {
    this.#disposalAbortController?.abort();
    const children = this.#internalChildren.items;

    for (let i = 0, len = children.length; i < len; i++)
    {
      const child = children[i];
      child.childId = 0;
      child.parent = null;
      child.dispose();
    }

    super.dispose();
  }

  public override applyTransformsAt(time: number, propagateChildren: boolean = false)
  {
    super.applyTransformsAt(time, propagateChildren);
    if (!propagateChildren)
      return;

    const children = this.#internalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
      children[i].applyTransformsAt(time, true);
  }

  public override finishTransforms(propagateChildren: boolean = false, targetMember?: string)
  {
    super.finishTransforms(propagateChildren, targetMember);
    if (!propagateChildren)
      return;

    const children = this.#internalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
      children[i].finishTransforms(true);
  }

  public override clearTransformsAfter(time: number, propagateChildren: boolean = false, targetMember?: string)
  {
    super.clearTransformsAfter(time, propagateChildren, targetMember);
    if (this.autoSizeAxes !== 0 && this.autoSizeDuration > 0)
      this.#childrenSizeDependencies.invalidate();

    if (!propagateChildren)
      return;

    const children = this.#internalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
    {
      const child = children[i];
      child.clearTransformsAfter(time, true, targetMember);
    }
  }

  public override addDelay(duration: number, propagateChildren: boolean = false)
  {
    if (duration === 0)
    {
      return;
    }

    super.addDelay(duration, propagateChildren);
    if (!propagateChildren)
      return;

    const children = this.#internalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
    {
      const child = children[i];
      child.addDelay(duration, true);
    }
  }

  public override beginAbsoluteSequence(newTransformStartTime: number, recursive: boolean = true): IUsable
  {
    if (!recursive || this.#internalChildren.length === 0)
      return super.beginAbsoluteSequence(newTransformStartTime, false);

    const absoluteSequenceActions = new List<AbsoluteSequenceSender>(this.#internalChildren.length + 1);

    super.collectAbsoluteSequenceActionsFromSubTree(newTransformStartTime, absoluteSequenceActions);
    const children = this.#internalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
      children[i].collectAbsoluteSequenceActionsFromSubTree(newTransformStartTime, absoluteSequenceActions);

    return new ValueInvokeOnDisposal(() =>
    {
      for (const a of absoluteSequenceActions)
        a.dispose();
    });
  }

  public override get removeCompletedTransforms()
  {
    return super.removeCompletedTransforms;
  }

  public override set removeCompletedTransforms(value)
  {
    if (this.removeCompletedTransforms === value)
      return;

    super.removeCompletedTransforms = value;

    const children = this.#internalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
      children[i].removeCompletedTransforms = value;
  }

  public override collectAbsoluteSequenceActionsFromSubTree(
    newTransformStartTime: number,
    actions: List<AbsoluteSequenceSender>,
  )
  {
    super.collectAbsoluteSequenceActionsFromSubTree(newTransformStartTime, actions);

    const children = this.#internalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
      children[i].collectAbsoluteSequenceActionsFromSubTree(newTransformStartTime, actions);
  }

  public findChildrenOfType<T extends Drawable>(type: abstract new (...args: any[]) => T): T[]
  {
    const result: T[] = [];

    const children = this.#internalChildren.items;
    for (let i = 0, len = children.length; i < len; i++)
    {
      const child = children[i];

      if (child instanceof type)
        result.push(child);

      if (child instanceof CompositeDrawable)
        result.push(...child.findChildrenOfType(type));
    }

    return result;
  }

  public transformPadding(newPadding: MarginPadding | MarginPaddingOptions, duration: number = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.transformTo("padding", MarginPadding.from(newPadding), duration, easing);
  }

  get #effectiveCornerRadius()
  {
    const cornerRadius = this.cornerRadius;

    if (cornerRadius === 0)
      return 0;

    const { drawWidth, drawHeight } = this;

    return Math.min(cornerRadius , drawWidth / 2, drawHeight / 2);
  }

  protected override containsLocal(localPosition: Vec2): boolean
  {
    const radius = this.#effectiveCornerRadius;

    if (radius === 0.0)
      return super.containsLocal(localPosition);

    const exponent = this.cornerExponent;

    const left = radius;
    const top = radius;
    const right = this.drawWidth - radius;
    const bottom = this.drawHeight - radius;

    const distX = Math.max(0.0,localPosition.x - right, left - localPosition.x);
    const distY = Math.max(0.0,localPosition.y - bottom, top - localPosition.y);

    const distance = Math.pow(distX, exponent) + Math.pow(distY, exponent);

    return distance < Math.pow(radius, exponent);
  }
}

enum ChildLifeStateChange
{
  None = 0,
  MadeAlive = 1 << 0,
  MadeDead = 1 << 1,
  Removed = 1 << 2,

  MadeAliveOrDead = MadeAlive | MadeDead,
}
