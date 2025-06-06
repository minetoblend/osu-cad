import type { Bindable } from "../../bindables";
import type { ReadonlyDependencyContainer } from "../../di/DependencyContainer";
import type { ClickEvent } from "../../input/events/ClickEvent";
import type { DoubleClickEvent } from "../../input/events/DoubleClickEvent";
import type { DragEndEvent } from "../../input/events/DragEndEvent";
import type { DragEvent } from "../../input/events/DragEvent";
import type { DragStartEvent } from "../../input/events/DragStartEvent";
import type { DropEvent } from "../../input/events/DropEvent";
import type { FocusEvent } from "../../input/events/FocusEvent";
import type { FocusLostEvent } from "../../input/events/FocusLostEvent";
import type { HoverEvent } from "../../input/events/HoverEvent";
import type { HoverLostEvent } from "../../input/events/HoverLostEvent";
import type { KeyDownEvent } from "../../input/events/KeyDownEvent";
import type { KeyUpEvent } from "../../input/events/KeyUpEvent";
import type { MouseDownEvent } from "../../input/events/MouseDownEvent";
import type { MouseMoveEvent } from "../../input/events/MouseMoveEvent";
import type { MouseUpEvent } from "../../input/events/MouseUpEvent";
import type { ScrollEvent } from "../../input/events/ScrollEvent";
import type { TouchDownEvent } from "../../input/events/TouchDownEvent";
import type { TouchMoveEvent } from "../../input/events/TouchMoveEvent";
import type { TouchUpEvent } from "../../input/events/TouchUpEvent";
import type { UIEvent } from "../../input/events/UIEvent";
import type { IInputReceiver } from "../../input/IInputReceiver";
import type { InputManager } from "../../input/InputManager";
import type { BLEND_MODES, ColorSource, Filter, Container as PIXIContainer } from "pixi.js";
import type { IFrameBasedClock } from "../../timing/IFrameBasedClock";
import type { IDisposable } from "../../types/IDisposable";
import type { List } from "../../utils/List";
import type { CompositeDrawable } from "../containers/CompositeDrawable";
import type { TypedTransform } from "../transforms/Transform";
import { Matrix } from "pixi.js";
import { Action } from "../../bindables/Action";
import { popDrawableScope, pushDrawableScope } from "../../bindables/lifetimeScope";
import { getAsyncDependencyLoaders, getDependencyLoaders, getInjections } from "../../di/decorators";
import { HandleInputCache } from "../../input/HandleInputCache";
import { isFocusManager } from "../../input/IFocusManager";
import { Quad } from "../../math/Quad";
import { Rectangle } from "../../math/Rectangle";
import { type IVec2, Vec2 } from "../../math/Vec2";
import { Color } from "pixi.js";
import { Scheduler } from "../../scheduling/Scheduler";
import { FrameStatistics } from "../../statistics/FrameStatistics";
import { StatisticsCounterType } from "../../statistics/StatisticsCounterType";
import { almostEquals } from "../../utils/almostEquals";
import { debugAssert } from "../../utils/debugAssert";
import { EasingFunction } from "../transforms/EasingFunction";
import { Transformable } from "../transforms/Transformable";
import { TransformBindable } from "../transforms/TransformBindable";
import { TransformCustom } from "../transforms/TransformCustom";
import { TransformSequence, type TransformSequenceProxy } from "../transforms/TransformSequence";
import { Anchor } from "./Anchor";
import { Axes } from "./Axes";
import { FillMode } from "./FillMode";
import { LayoutComputed } from "./LayoutComputed";
import { LayoutMember } from "./LayoutMember";
import { MarginPadding, type MarginPaddingOptions } from "./MarginPadding";
import { PositionOffsetTransform } from "./PositionOffsetTransform";

export interface DrawableOptions
{
  position?: IVec2;
  x?: number;
  y?: number;
  size?: IVec2 | number;
  width?: number;
  height?: number;
  rotation?: number;
  scale?: IVec2 | number;
  skew?: IVec2;
  alpha?: number;
  color?: ColorSource;
  tint?: ColorSource;
  relativeSizeAxes?: Axes;
  relativePositionAxes?: Axes;
  bypassAutoSizeAxes?: Axes;
  anchor?: Anchor;
  origin?: Anchor;
  margin?: MarginPadding | MarginPaddingOptions;
  label?: string;
  filters?: Filter[];
  blendMode?: BLEND_MODES;
  fillMode?: FillMode;
  fillAspectRatio?: number;
  depth?: number;
  clock?: IFrameBasedClock;
  processCustomClock?: boolean;
  alwaysPresent?: boolean;
}

export const LOAD = Symbol("load");
export const LOAD_FROM_ASYNC = Symbol("loadFromAsync");

// eslint-disable-next-line @typescript-eslint/no-empty-object-type,@typescript-eslint/no-empty-interface
export interface Drawable extends OsucadMixins.Drawable
{
}

export abstract class Drawable extends Transformable implements IDisposable, IInputReceiver
{
  constructor()
  {
    super();

    this.addLayout(this.#transformBacking);
    this.addLayout(this.#drawSizeBacking);
    this.addLayout(this.#requiredParentSizeToFitBacking);

    this.#transformBacking.validateParent = false;

    this.label = this.constructor.name;

    const injections = getInjections(this);
    for (const { key } of injections)
      Reflect.set(this, key, null);
  }

  with(options: DrawableOptions): this
  {
    Object.assign(this, options);
    return this;
  }

  adjust(fn: (drawable: this) => void, ensureLoaded: boolean = false): this
  {
    if (ensureLoaded && this.loadState < LoadState.Ready)
      this.onLoadComplete.addListener(() => fn(this));
    else
      fn(this);
    return this;
  }

  label?: string;

  get typeName()
  {
    return this.constructor.name;
  }

  public static mixin(source: Record<string, any>): void
  {
    Object.defineProperties(Drawable.prototype, Object.getOwnPropertyDescriptors(source));
  }

  // #region drawNode

  protected abstract createDrawNode(): PIXIContainer;

  #drawNode?: PIXIContainer;

  get drawNode()
  {
    this.#drawNode ??= this.createDrawNode();
    this.#drawNode.label = this.label ?? "";
    return this.#drawNode;
  }

  get drawNodePosition(): Vec2
  {
    return Vec2.from(this.drawNode.position);
  }

  // #endregion

  // #region position

  #x = 0;

  get x()
  {
    return this.#x;
  }

  set x(value: number)
  {
    if (this.#x === value)
      return;

    debugAssert(Number.isFinite(value), "x must be finite");

    this.#x = value;
    this.invalidate(Invalidation.Transform);
  }

  #y = 0;

  get y()
  {
    return this.#y;
  }

  set y(value: number)
  {
    if (this.#y === value)
      return;

    debugAssert(Number.isFinite(value), "y must be finite");

    this.#y = value;
    this.invalidate(Invalidation.Transform);
  }

  get position(): Vec2
  {
    return new Vec2(this.x, this.y);
  }

  // #endregion

  // #region size

  set position(value: IVec2)
  {
    if (this.x === value.x && this.y === value.y)
      return;

    debugAssert(Number.isFinite(value.x), "x must be finite");
    debugAssert(Number.isFinite(value.y), "y must be finite");

    this.#x = value.x;
    this.#y = value.y;

    this.invalidate(Invalidation.Transform);
    this.updateDrawNodeTransform();
  }

  #width = 0;

  get width()
  {
    return this.#width;
  }

  set width(value: number)
  {
    if (this.#width === value)
      return;

    debugAssert(Number.isFinite(value), "width must be finite");

    this.#width = value;

    this.#invalidateParentSizeDependencies(Invalidation.DrawSize, Axes.X);
  }

  #height = 0;

  get height()
  {
    return this.#height;
  }

  set height(value: number)
  {
    if (this.#height === value)
      return;

    debugAssert(Number.isFinite(value), "height must be finite");

    this.#height = value;

    this.#invalidateParentSizeDependencies(Invalidation.DrawSize, Axes.Y);
  }

  get size(): Vec2
  {
    return new Vec2(this.width, this.height);
  }

  set size(value: IVec2 | number)
  {
    // TODO: optimize this

    if (typeof value === "number")
    {
      this.width = value;
      this.height = value;
    }
    else
    {
      this.width = value.x;
      this.height = value.y;
    }
  }

  // #endregion

  // #region scale

  #scale = new Vec2(1);

  get scale(): Readonly<Vec2>
  {
    return this.#scale;
  }

  set scale(value: IVec2 | number)
  {
    if (typeof value === "number")
      value = { x: value, y: value };

    if (this.#scale.equals(value))
      return;

    this.drawNode.scale?.copyFrom(value);

    this.#scale.x = value.x;
    this.#scale.y = value.y;

    this.#parent?.invalidateChildrenSizeDependencies(Invalidation.Transform, Axes.Both, this);
  }

  get drawScale()
  {
    return this.#scale;
  }

  get scaleX()
  {
    return this.#scale.x;
  }

  set scaleX(value: number)
  {
    if (this.#scale.x === value)
      return;

    this.#scale.x = value;

    const scale = this.drawNode.scale;
    if (scale)
      scale.x = value;

    this.#parent?.invalidateChildrenSizeDependencies(Invalidation.Transform, Axes.X, this);
  }

  get scaleY()
  {
    return this.#scale.y;
  }

  set scaleY(value: number)
  {
    if (this.#scale.y === value)
      return;

    this.#scale.y = value;

    const scale = this.drawNode.scale;
    if (scale)
      scale.x = value;

    this.#parent?.invalidateChildrenSizeDependencies(Invalidation.Transform, Axes.Y, this);
  }

  // #endregion

  // #region rotation

  #rotation = 0;

  get rotation()
  {
    return this.#rotation;
  }

  set rotation(value: number)
  {
    if (this.#rotation === value)
      return;

    debugAssert(Number.isFinite(value), "rotation must be finite");

    this.#rotation = value;
    this.drawNode.rotation = value;
  }

  // endregion

  // region skew
  get skew()
  {
    return this.#skew;
  }

  set skew(value: IVec2)
  {
    if (this.#skew.equals(value))
      return;

    this.#skew = Vec2.from(value);
    this.drawNode.skew.copyFrom(value);
  }

  #skew: Vec2 = Vec2.zero();
  // endregion

  // region tint & alpha

  #color: Color = new Color(0xFFFFFF);

  get color(): Color
  {
    return this.#color;
  }

  set color(value: ColorSource)
  {
    debugAssert(Color.isColorLike(value), "color must be a valid color-like value");

    this.#color.setValue(value);

    this.updateDrawNodeColor();
  }

  get tint()
  {
    return this.#color.toNumber();
  }

  set tint(value: ColorSource)
  {
    debugAssert(Color.isColorLike(value), "tint must be a valid color-like value");

    const alpha = this.#color.alpha;
    this.#color.setValue(value);
    this.#color.setAlpha(alpha);

    this.updateDrawNodeColor();
  }

  #alpha = 1;

  get alpha()
  {
    return this.#alpha;
  }

  set alpha(value: number)
  {
    if (this.#alpha === value)
      return;

    const wasPresent = this.isPresent;

    this.#alpha = value;

    this.updateDrawNodeColor();

    if (this.isPresent !== wasPresent)
      this.invalidate(Invalidation.Presence);
  }

  get blendMode()
  {
    return this.drawNode.blendMode;
  }

  set blendMode(value: BLEND_MODES)
  {
    this.drawNode.blendMode = value;
  }

  get isPresent()
  {
    return this.#alwaysPresent || this.#alpha > 0.0001;
  }

  #alwaysPresent = false;

  get alwaysPresent()
  {
    return this.#alwaysPresent;
  }

  set alwaysPresent(value: boolean)
  {
    if (this.#alwaysPresent === value)
      return;

    const wasPresent = this.isPresent;

    this.#alwaysPresent = value;

    if (this.isPresent !== wasPresent)
    {
      this.invalidate(Invalidation.Presence);
    }
  }

  // #endregion

  // #region layout

  onSizingChanged()
  {
  }

  #relativeSizeAxes: Axes = Axes.None;

  get relativeSizeAxes()
  {
    return this.#relativeSizeAxes;
  }

  set relativeSizeAxes(value: Axes)
  {
    if (this.#relativeSizeAxes === value)
      return;

    if (this.#fillMode !== FillMode.Stretch && (value === Axes.Both || this.#relativeSizeAxes === Axes.Both))
    {
      this.invalidate(Invalidation.DrawSize);
    }
    else
    {
      const conversion = this.#relativeToAbsoluteFactor;
      if ((value & Axes.X) > (this.#relativeSizeAxes & Axes.X))
        this.width = almostEquals(conversion.x, 0) ? 0 : this.width / conversion.x;
      else if ((this.#relativeSizeAxes & Axes.X) > (value & Axes.X))
        this.width *= conversion.x;

      if ((value & Axes.Y) > (this.#relativeSizeAxes & Axes.Y))
        this.height = almostEquals(conversion.y, 0) ? 0 : this.height / conversion.y;
      else if ((this.#relativeSizeAxes & Axes.Y) > (value & Axes.Y))
        this.height *= conversion.y;
    }

    this.#relativeSizeAxes = value;

    if (value & Axes.X && this.width === 0)
      this.width = 1;
    if (value & Axes.Y && this.height === 0)
      this.height = 1;

    this.invalidate(Invalidation.DrawSize);

    this.#updateBypassAutoSizeAxes();

    this.onSizingChanged();
  }

  #relativePositionAxes: Axes = Axes.None;

  get relativePositionAxes()
  {
    return this.#relativePositionAxes;
  }

  set relativePositionAxes(value: Axes)
  {
    if (this.#relativePositionAxes === value)
      return;

    const conversion = this.#relativeToAbsoluteFactor;

    if ((value & Axes.X) > (this.#relativePositionAxes & Axes.X))
      this.x = almostEquals(conversion.x, 0) ? 0 : this.x / conversion.x;
    else if ((this.#relativePositionAxes & Axes.X) > (value & Axes.X))
      this.x *= conversion.x;

    if ((value & Axes.Y) > (this.#relativePositionAxes & Axes.Y))
      this.y = almostEquals(conversion.y, 0) ? 0 : this.y / conversion.y;
    else if ((this.#relativePositionAxes & Axes.Y) > (value & Axes.Y))
      this.y *= conversion.y;

    this.#relativePositionAxes = value;

    this.#updateBypassAutoSizeAxes();
  }

  protected applyRelativeAxes(axes: Axes, v: Vec2, fillMode: FillMode): Readonly<Vec2>
  {
    if (axes === Axes.None)
    {
      return v;
    }

    let x = v.x;
    let y = v.y;

    const conversion = this.#relativeToAbsoluteFactor;

    if (axes & Axes.X)
    {
      x *= conversion.x;
    }

    if (axes & Axes.Y)
    {
      y *= conversion.y;
    }

    if (this.relativeSizeAxes === Axes.Both && fillMode !== FillMode.Stretch)
    {
      if (fillMode === FillMode.Fill)
        x = y = Math.max(x, y * this.#fillAspectRatio);
      else if (fillMode === FillMode.Fit)
        x = y = Math.min(x, y * this.#fillAspectRatio);
      y /= this.#fillAspectRatio;
    }

    v.x = x;
    v.y = y;

    return v;
  }

  #anchor: Anchor = Anchor.TopLeft;

  get anchor(): Anchor
  {
    return this.#anchor;
  }

  set anchor(value: Anchor)
  {
    if (this.#anchor === value)
      return;

    this.#anchor = value;

    this.invalidate(Invalidation.Transform);
  }

  get relativeAnchorPosition(): Vec2
  {
    let x = 0;
    let y = 0;

    if (this.#anchor & Anchor.x1)
    {
      x = 0.5;
    }
    else if (this.#anchor & Anchor.x2)
    {
      x = 1;
    }

    if (this.#anchor & Anchor.y1)
    {
      y = 0.5;
    }
    else if (this.#anchor & Anchor.y2)
    {
      y = 1;
    }

    return new Vec2(x, y);
  }

  get anchorPosition(): Vec2
  {
    if (this.parent)
    {
      return this.relativeAnchorPosition.mulInPlace(this.parent.childSize);
    }

    return this.relativeAnchorPosition;
  }

  #origin: Anchor = Anchor.TopLeft;

  get origin(): Anchor
  {
    return this.#origin;
  }

  set origin(value: Anchor)
  {
    if (this.#origin === value)
      return;

    this.#origin = value;

    this.invalidate(Invalidation.Transform);
  }

  get relativeOriginPosition(): Vec2
  {
    const v = Vec2.zero();

    if (this.#origin & Anchor.x1)
    {
      v.x = 0.5;
    }
    else if (this.#origin & Anchor.x2)
    {
      v.x = 1;
    }

    if (this.#origin & Anchor.y1)
    {
      v.y = 0.5;
    }
    else if (this.#origin & Anchor.y2)
    {
      v.y = 1;
    }

    return v;
  }

  get originPosition()
  {
    return this.relativeOriginPosition.mulInPlace(this.drawSize);
  }

  #margin: MarginPadding = new MarginPadding();

  get margin(): MarginPadding
  {
    return this.#margin;
  }

  set margin(value: MarginPadding | MarginPaddingOptions)
  {
    this.#margin = MarginPadding.from(value);
  }

  #fillMode = FillMode.Stretch;

  get fillMode()
  {
    return this.#fillMode;
  }

  set fillMode(value: FillMode)
  {
    if (this.#fillMode === value)
      return;

    this.#fillMode = value;
    this.invalidate(Invalidation.DrawSize);
  }

  protected get hasAsyncLoader()
  {
    return false;
  }

  #fillAspectRatio = 1;

  get fillAspectRatio()
  {
    return this.#fillAspectRatio;
  }

  set fillAspectRatio(value: number)
  {
    if (this.#fillAspectRatio === value)
      return;

    if (!Number.isFinite(value))
      throw new Error("fillAspectRatio must be finite");
    if (value === 0)
      throw new Error("fillAspectRatio cannot be 0");

    this.#fillAspectRatio = value;

    if (this.#fillMode !== FillMode.Stretch && this.relativeSizeAxes === Axes.Both)
    {
      this.invalidate(Invalidation.DrawSize);
    }
  }

  // #endregion

  // #region computed layout properties

  get drawPosition(): Vec2
  {
    const position = this.applyRelativeAxes(this.#relativePositionAxes, this.position, FillMode.Stretch) as Vec2;

    position.x += this.margin.left;
    position.y += this.margin.top;

    return position;
  }

  #drawSizeBacking = new LayoutComputed(
      () => this.applyRelativeAxes(this.relativeSizeAxes, this.size, this.fillMode),
      Invalidation.Transform | Invalidation.RequiredParentSizeToFit | Invalidation.Presence,
  );

  get drawSize(): Vec2
  {
    return this.#drawSizeBacking.value;
  }

  get drawWidth()
  {
    return this.drawSize.x;
  }

  get drawHeight()
  {
    return this.drawSize.y;
  }

  get drawRectangle()
  {
    const s = this.drawSize;
    return new Rectangle(0, 0, s.x, s.y);
  }

  get layoutSize(): Vec2
  {
    return this.drawSize.add(this.margin.total);
  }

  get layoutRectangle(): Rectangle
  {
    return new Rectangle(-this.margin.left, -this.margin.top, this.layoutSize.x, this.layoutSize.y);
  }

  get boundingBox(): Rectangle
  {
    return this.rectToParentSpace(this.layoutRectangle).AABB;
  }

  get screenSpaceDrawQuad(): Quad
  {
    const rect = new Rectangle(0, 0, this.drawWidth, this.drawHeight);

    return Quad.fromRectangle(rect).transform(this.drawNode.worldTransform);
  }

  #requiredParentSizeToFitBacking = new LayoutComputed(() =>
  {
    const ap = this.anchorPosition;
    const rap = this.relativeAnchorPosition;

    const ratio1 = new Vec2(
      rap.x <= 0 ? 0 : 1 / rap.x,
      rap.y <= 0 ? 0 : 1 / rap.y,
    );

    const ratio2 = new Vec2(
      rap.x >= 1 ? 0 : 1 / (1 - rap.x),
      rap.y >= 1 ? 0 : 1 / (1 - rap.y),
    );

    const bbox = this.boundingBox;

    const topLeftOffset = ap.sub(bbox.topLeft);
    const topLeftSize1 = topLeftOffset.mul(ratio1);
    const topLeftSize2 = topLeftOffset.mulF(-1).mul(ratio2);

    const bottomRightOffset = ap.sub(bbox.bottomRight);
    const bottomRightSize1 = bottomRightOffset.mul(ratio1);
    const bottomRightSize2 = bottomRightOffset.mulF(-1).mul(ratio2);

    return topLeftSize1.componentMax(topLeftSize2).componentMax(bottomRightSize1).componentMax(bottomRightSize2);
  }, Invalidation.RequiredParentSizeToFit);

  get requiredParentSizeToFit(): Vec2
  {
    return this.#requiredParentSizeToFitBacking.value;
  }

  get #relativeToAbsoluteFactor(): Vec2
  {
    return this.parent?.relativeToAbsoluteFactor ?? new Vec2(1);
  }

  // #endregion

  // #region filters

  get filters(): Filter[]
  {
    return this.drawNode.filters as Filter[];
  }

  set filters(value: Filter[])
  {
    this.drawNode.filters = value;
  }

  // #endregion

  // #region lifecycle

  lifetimeChanged = new Action<Drawable>();

  get lifetimeStart()
  {
    return this.#lifeTimeStart;
  }

  set lifetimeStart(value: number)
  {
    if (this.#lifeTimeStart === value)
      return;

    this.#lifeTimeStart = value;
    this.#onLifetimeChanged();
    this.lifetimeChanged.emit(this);
  }

  #onLifetimeChanged()
  {
    this.#hasLifeTime = this.#lifeTimeStart !== -Number.MAX_VALUE || this.#lifeTimeEnd !== Number.MAX_VALUE;
  }

  get lifetimeEnd()
  {
    return this.#lifeTimeEnd;
  }

  set lifetimeEnd(value: number)
  {
    if (this.#lifeTimeEnd === value)
      return;

    this.#lifeTimeEnd = value;
    this.#onLifetimeChanged();
    this.lifetimeChanged.emit(this);
  }

  #lifeTimeStart = -Number.MAX_VALUE;

  #lifeTimeEnd = Number.MAX_VALUE;

  #hasLifeTime = false;

  hide()
  {
    this.fadeOut();
  }

  show()
  {
    this.fadeIn();
  }

  isAlive = false;

  get shouldBeAlive(): boolean
  {
    if (!this.#hasLifeTime)
      return true;

    return this.clock!.timeInfo.current >= this.#lifeTimeStart && this.clock!.timeInfo.current < this.#lifeTimeEnd;
  }

  get removeWhenNotAlive()
  {
    return this.parent === null || this.clock!.timeInfo.current > this.#lifeTimeStart;
  }

  get disposeOnDeathRemoval()
  {
    return this.removeCompletedTransforms;
  }

  loadState: LoadState = LoadState.NotLoaded;

  get isLoaded()
  {
    return this.loadState === LoadState.Loaded;
  }

  #dependencies!: ReadonlyDependencyContainer;

  get dependencies()
  {
    return this.#dependencies;
  }

  #loadComplete()
  {
    if (this.loadState < LoadState.Ready)
      return;

    this.loadState = LoadState.Loaded;

    this.invalidate(Invalidation.Layout, InvalidationSource.Parent);

    this.loadComplete();

    this.onLoadComplete.emit(this);
    this.onLoadComplete.removeAllListeners();
  }

  async [LOAD](
    clock: IFrameBasedClock,
    dependencies: ReadonlyDependencyContainer,
    isDirectAsyncContext = false,
  )
  {
    try
    {
      if (this.loadState !== LoadState.NotLoaded)
        return;

      this.updateClock(clock);

      pushDrawableScope(this);
      this.loadState = LoadState.Loading;

      this.#requestsNonPositionalInput = HandleInputCache.requestsNonPositionalInput(this);
      this.#requestsPositionalInput = HandleInputCache.requestsPositionalInput(this);

      this.requestsNonPositionalInputSubTree = this.requestsNonPositionalInput;
      this.requestsPositionalInputSubTree = this.requestsPositionalInput;

      this.injectDependencies(dependencies);
      const dependencyLoaders = getDependencyLoaders(this);

      for (const key of dependencyLoaders)
      {
        (this as any)[key](dependencies);
      }

      this.load(dependencies);

      this.onLoad();

      const asyncDependencyLoaders = getAsyncDependencyLoaders(this);
      if (this.hasAsyncLoader || asyncDependencyLoaders.length > 0)
      {
        if (!isDirectAsyncContext)
        {
          throw new Error("Cannot load async dependencies in a non-async context");
        }

        await Promise.all([
          this.loadAsync(dependencies),
          ...asyncDependencyLoaders.map(key => (this as any)[key](this.dependencies)),
        ]);
      }

      this.loadAsyncComplete();

      this.loadState = LoadState.Ready;
    }
    finally
    {
      popDrawableScope();
    }
  }

  #isLoadingFromAsync = false;

  protected get isLoadingFromAsync()
  {
    return this.#isLoadingFromAsync;
  }

  async [LOAD_FROM_ASYNC](
    clock: IFrameBasedClock,
    dependencies: ReadonlyDependencyContainer,
    isDirectAsyncContext = false,
  ): Promise<boolean>
  {
    if (this.isDisposed)
    {
      return false;
    }
    this.#isLoadingFromAsync = true;

    await this[LOAD](clock, dependencies, isDirectAsyncContext);

    this.#isLoadingFromAsync = false;

    return true;
  }

  #clock: IFrameBasedClock | null = null;

  #customClock?: IFrameBasedClock;

  processCustomClock = false;

  protected load(dependencies: ReadonlyDependencyContainer)
  {
  }

  protected async loadAsync(dependencies: ReadonlyDependencyContainer)
  {
  }

  override get clock(): IFrameBasedClock | null
  {
    return this.#clock;
  }

  set clock(value: IFrameBasedClock)
  {
    this.#customClock = value;
    this.updateClock(value);
  }

  expire(calculateLifetimeStart = false)
  {
    if (this.#clock === null)
    {
      this.lifetimeEnd = -Number.MAX_VALUE;
      return;
    }

    this.lifetimeEnd = this.latestTransformEndTime;

    if (calculateLifetimeStart)
    {
      let min = Infinity;

      for (const t of this.transforms)
      {
        if (t.startTime < min)
          min = t.startTime;
      }

      this.lifetimeStart = min < Infinity ? min : -Number.MAX_VALUE;
    }
  }

  updateClock(clock: IFrameBasedClock)
  {
    this.#clock = this.#customClock ?? clock;
    this.#scheduler?.updateClock(this.#clock);
  }

  protected onLoad()
  {
  }

  protected loadComplete()
  {
  }

  protected loadAsyncComplete()
  {
  }

  onLoadComplete = new Action<Drawable>();

  protected injectDependencies(dependencies: ReadonlyDependencyContainer)
  {
    this.#dependencies ??= dependencies;

    const injections = getInjections(this);
    // eslint-disable-next-line prefer-const
    for (let { key, type, optional } of injections)
    {
      if (typeof type === "function" && type.name === "")
        type = type();

      Reflect.set(this, key, optional ? this.dependencies.resolveOptional(type) : this.dependencies.resolve(type));
    }
  }

  isDisposed = false;

  dispose(isDisposing = true): void
  {
    if (this.isDisposed)
      return;

    this.#parent = null;
    this.childId = 0;
    this.invalidated.removeAllListeners();

    this.drawNode?.destroy({ children: true });
    for (const callback of this.#onDispose)
    {
      callback();
    }

    const descriptors = Object.getOwnPropertyDescriptors(this);

    for (const key in descriptors)
    {
      const descriptor = descriptors[key];

      const value = descriptor.value;
      if (value && typeof value === "object" && "unbindAll" in value && typeof value.unbindAll === "function")
      {
        value.unbindAll();
      }
    }

    this.isDisposed = true;
  }

  #onDispose: (() => void)[] = [];

  #invalidateParentSizeDependencies(invalidation: Invalidation, changedAxes: Axes)
  {
    this.invalidate(invalidation, InvalidationSource.Self, false);

    this.#parent?.invalidateChildrenSizeDependencies(invalidation, changedAxes, this);
  }

  #bypassAutoSizeAxes: Axes = Axes.None;

  #bypassAutoSizeAdditionalAxes: Axes = Axes.None;

  get bypassAutoSizeAxes(): Axes
  {
    return this.#bypassAutoSizeAxes;
  }

  set bypassAutoSizeAxes(value: Axes)
  {
    this.#bypassAutoSizeAdditionalAxes = value;
    this.#updateBypassAutoSizeAxes();
  }

  #updateBypassAutoSizeAxes()
  {
    const value = this.#relativePositionAxes | this.#relativeSizeAxes | this.#bypassAutoSizeAdditionalAxes;

    if (this.#bypassAutoSizeAxes !== value)
    {
      const changedAxes = this.#bypassAutoSizeAxes ^ value;
      this.#bypassAutoSizeAxes = value;
      if ((this.#parent?.autoSizeAxes ?? 0) & changedAxes)
        this.#parent?.invalidate(Invalidation.RequiredParentSizeToFit, InvalidationSource.Child);
    }
  }

  onDispose(callback: () => void): void
  {
    this.#onDispose.push(callback);
  }

  withScope<T>(callback: () => T): T
  {
    try
    {
      pushDrawableScope(this);
      return callback();
    }
    finally
    {
      popDrawableScope();
    }
  }

  // #endregion

  // #region parent

  childId = 0;

  protected get isPartOfComposite()
  {
    return this.childId !== 0;
  }

  #parent: CompositeDrawable | null = null;

  #depth = 0;

  get depth()
  {
    return this.#depth;
  }

  set depth(value: number)
  {
    if (this.isPartOfComposite)
    {
      throw new Error("May not change depth while inside a parent CompositeDrawable.");
    }

    this.#depth = value;

    this.drawNode.zIndex = -value;
  }

  get parent()
  {
    return this.#parent;
  }

  set parent(value: CompositeDrawable | null)
  {
    if (value === null)
    {
      this.childId = 0;
    }

    if (this.#parent === value)
      return;

    this.#parent = value;

    this.invalidate(this.invalidationFromParentSize | Invalidation.Presence | Invalidation.Parent);
  }

  findClosestParent<T extends Drawable>(predicate: (d: Drawable) => d is T): T | null
  {
    let parent = this.parent;

    while (parent)
    {
      if (predicate(parent))
      {
        return parent;
      }

      parent = parent.parent;
    }

    return null;
  }

  findClosestParentOfType<T extends Drawable>(type: abstract new (...args: any[]) => T): T | null
  {
    let parent = this.parent;

    while (parent)
    {
      if (parent instanceof type)
      {
        return parent;
      }

      parent = parent.parent;
    }

    return null;
  }

  isRootedAt(parent: CompositeDrawable): boolean
  {
    let current: Drawable | null = this;

    while (current)
    {
      if (current === parent)
      {
        return true;
      }

      current = current.parent;
    }

    return false;
  }

  // #endregion

  // #region update & invalidation

  #scheduler: Scheduler | null = null;

  get scheduler(): Scheduler
  {
    if (this.#scheduler)
    {
      return this.#scheduler;
    }

    this.#scheduler = new Scheduler(this.#clock);
    return this.#scheduler;
  }

  schedule(action: () => void)
  {
    this.scheduler.add(action);
  }

  updateSubTree(): boolean
  {
    // if (this.isDisposed)
    //   throw new Error('Cannot update disposed drawable');

    if (this.processCustomClock)
      this.#customClock!.processFrame();

    if (this.loadState < LoadState.Ready)
      return false;

    if (this.loadState === LoadState.Ready)
      this.#loadComplete();

    this.updateTransforms();

    if (!this.isPresent)
      return true;

    if (this.#scheduler !== null)
    {
      const amountScheduledTasks = this.#scheduler.update();
      FrameStatistics.add(StatisticsCounterType.ScheduleInvk, amountScheduledTasks);
    }

    this.update();

    return true;
  }

  updateSubTreeTransforms(): boolean
  {
    if (!this.isPresent)
      return false;

    if (!this.#transformBacking.isValid)
    {
      this.updateDrawNodeTransform();
      FrameStatistics.increment(StatisticsCounterType.DrawNodeTransforms);
      this.#transformBacking.validate();
    }

    return true;
  }

  update()
  {
  }

  readonly #transformBacking = new LayoutMember(Invalidation.Transform | Invalidation.DrawSize | Invalidation.Presence);

  updateDrawNodeTransform()
  {
    const {
      drawNode,
      drawPosition,
      anchorPosition,
      drawScale,
      originPosition,
    } = this;

    let x = drawPosition.x + anchorPosition.x;
    let y = drawPosition.y + anchorPosition.y;

    if (this.#parent)
    {
      const padding = this.#parent.padding;

      x += padding.left;
      y += padding.top;
    }

    drawNode._position._x = x;
    drawNode._position._y = y;
    drawNode.pivot._x = originPosition.x;
    drawNode.pivot._y = originPosition.y;
    drawNode._scale._x = drawScale.x;
    drawNode._scale._y = drawScale.y;

    drawNode._onUpdate();
  }

  updateDrawNodeColor()
  {
    this.drawNode.alpha = this.alpha * this.#color.alpha;
    this.drawNode.tint = this.tint;
  }

  #layoutMembers: LayoutMember[] = [];

  addLayout(layout: LayoutMember)
  {
    layout.parent = this;
    this.#layoutMembers.push(layout);
  }

  invalidate(
    invalidation: Invalidation,
    source: InvalidationSource = InvalidationSource.Self,
    propagateToParent = true,
  ): boolean
  {
    if (propagateToParent && source === InvalidationSource.Self)
    {
      this.parent?.invalidate(invalidation, InvalidationSource.Child);
    }

    if (!this.#invalidate(invalidation, source))
    {
      return false;
    }

    let anyInvalidated = false;

    const layoutMembers = this.#layoutMembers;
    for (let i = 0, len = layoutMembers.length; i < len; i++)
    {
      const layout = layoutMembers[i];

      if (!(source & layout.source))
        continue;

      if (layout.invalidation & invalidation)
      {
        if (layout.isValid)
        {
          layout.invalidate();
          anyInvalidated = true;
        }
      }
    }

    if (this.onInvalidate(invalidation, source))
      anyInvalidated = true;

    this.invalidated.emit(this, invalidation);

    return anyInvalidated;
  }

  readonly invalidated = new Action<[Drawable, Invalidation]>();

  get invalidationFromParentSize(): Invalidation
  {
    let result = Invalidation.None;
    if (this.relativeSizeAxes !== Axes.None)
    {
      result |= Invalidation.DrawSize;
    }
    if (this.relativePositionAxes !== Axes.None)
    {
      result |= Invalidation.Transform;
    }
    return result;
  }

  get localTransform()
  {
    const transform = new Matrix();
    let pos = this.drawPosition.add(this.anchorPosition);

    if (this.parent)
    {
      pos = pos.add(this.parent.childOffset);
    }

    transform.translate(pos.x, pos.y);
    transform.scale(this.scale.x, this.scale.y);
    transform.rotate(this.rotation);

    transform.translate(-this.originPosition.x, -this.originPosition.y);

    return transform;
  }

  onInvalidate(invalidation: Invalidation, source: InvalidationSource): boolean
  {
    return false;
  }

  validateSuperTree(invalidation: Invalidation)
  {
    if (this.#validate(invalidation) && this.#parent !== null)
      this.#parent.validateSuperTree(invalidation);
  }

  // #endregion

  // #region input

  #requestsNonPositionalInput = false;

  get requestsNonPositionalInput()
  {
    return this.#requestsNonPositionalInput;
  }

  #requestsPositionalInput = false;

  get requestsPositionalInput()
  {
    return this.#requestsPositionalInput;
  }

  requestsNonPositionalInputSubTree = false;

  requestsPositionalInputSubTree = false;

  get handlePositionalInput()
  {
    return this.requestsPositionalInput;
  }

  get propagatePositionalInputSubTree()
  {
    return this.requestsPositionalInputSubTree && this.isPresent;
  }

  receivePositionalInputAt(screenSpacePosition: Vec2): boolean
  {
    return this.contains(screenSpacePosition);
  }

  receivePositionalInputAtLocal(localPosition: Vec2): boolean
  {
    return this.containsLocal(localPosition);
  }

  toLocalSpace(screenSpacePosition: Vec2, target: Vec2 = new Vec2()): Vec2
  {
    return this.drawNode.relativeGroupTransform.applyInverse(screenSpacePosition, target);
  }

  toScreenSpace(localSpacePosition: Vec2, target: Vec2 = new Vec2()): Vec2
  {
    return this.drawNode.relativeGroupTransform.apply(localSpacePosition, target);
  }

  toSpaceOfOtherDrawable(v: Vec2, other: Drawable): Vec2
  {
    return other.toLocalSpace(this.toScreenSpace(v));
  }

  toParentSpace(v: Vec2): Vec2
  {
    return this.toSpaceOfOtherDrawable(v, this.parent!);
  }

  rectToParentSpace(rect: Rectangle): Quad
  {
    this.updateDrawNodeTransform();
    return Quad.fromRectangle(rect).transform(this.localTransform);
  }

  contains(screenSpacePosition: Vec2): boolean
  {
    const pos = this.toLocalSpace(screenSpacePosition, this._tempVec2);

    return this.containsLocal(pos);
  }

  containsLocal(localPosition: Vec2): boolean
  {
    return localPosition.x >= 0 && localPosition.x <= this.drawSize.x && localPosition.y >= 0 && localPosition.y <= this.drawSize.y;
  }

  getContainingInputManager(): InputManager | null
  {
    return this.findClosestParent((d): d is InputManager =>
    {
      return !!("isInputManager" in d && d.isInputManager);
    });
  }

  getContainingFocusManager(): InputManager | null
  {
    return this.findClosestParent((d): d is InputManager => isFocusManager(d));
  }

  buildPositionalInputQueue(screenSpacePos: Vec2, queue: List<Drawable>): boolean
  {
    if (!this.propagatePositionalInputSubTree)
      return false;

    if (this.handlePositionalInput && this.receivePositionalInputAt(screenSpacePos))
    {
      queue.push(this);
    }

    return true;
  }

  _tempVec2 = new Vec2();

  buildPositionalInputQueueLocal(localPos: Vec2, queue: List<Drawable>): boolean
  {
    if (!this.propagatePositionalInputSubTree)
      return false;

    if (this.handlePositionalInput && this.receivePositionalInputAtLocal(localPos))
    {
      queue.push(this);
    }

    return true;
  }

  get handleNonPositionalInput()
  {
    return this.requestsNonPositionalInput;
  }

  get propagateNonPositionalInputSubTree()
  {
    return this.isPresent && this.requestsNonPositionalInputSubTree;
  }

  buildNonPositionalInputQueue(queue: List<Drawable>, allowBlocking = true)
  {
    if (!this.propagateNonPositionalInputSubTree)
      return false;

    if (this.handleNonPositionalInput)
      queue.push(this);

    return true;
  }

  triggerEvent(e: UIEvent): boolean
  {
    e.target = this;

    return this[e.handler]?.(e as any) ?? this.handle(e) ?? false;
  }

  get requiresHighFrequencyMousePosition()
  {
    return false;
  }

  handle(e: UIEvent)
  {
    return false;
  }

  onMouseDown?(e: MouseDownEvent): boolean;

  onMouseUp?(e: MouseUpEvent): void;

  onClick?(e: ClickEvent): boolean;

  onDoubleClick?(e: DoubleClickEvent): boolean;

  onDrag?(e: DragEvent): boolean;

  onDragStart?(e: DragStartEvent): boolean;

  onDragEnd?(e: DragEndEvent): void;

  onMouseMove?(e: MouseMoveEvent): boolean;

  onHover?(e: HoverEvent): boolean;

  onHoverLost?(e: HoverLostEvent): void;

  onScroll?(e: ScrollEvent): boolean;

  onFocus?(e: FocusEvent): void;

  onFocusLost?(e: FocusLostEvent): void;

  onKeyDown?(e: KeyDownEvent): boolean;

  onKeyUp?(e: KeyUpEvent): void;

  onTouchMove?(e: TouchMoveEvent): boolean;

  onTouchDown?(e: TouchDownEvent): boolean;

  onTouchUp?(e: TouchUpEvent): void;

  onDrop?(e: DropEvent): boolean;

  get dragBlocksClick()
  {
    return true;
  }

  isHovered = false;

  isDragged = false;

  hasFocus = false;

  get requestsFocus()
  {
    return false;
  }

  get acceptsFocus()
  {
    return false;
  }

  get changeFocusOnClick()
  {
    return true;
  }

  doWhenLoaded(fn: (drawable: this) => void, fullyLoaded = false): this
  {
    if (this.loadState >= (fullyLoaded ? LoadState.Loaded : LoadState.Ready))
      fn(this);
    else
      this.onLoadComplete.addListener(fn as any);
    return this;
  }

  // #endregion

  // #region transforms
  delay(duration: number): TransformSequenceProxy<this>
  {
    return new TransformSequence(this).delay(duration).asProxy();
  }

  delayUntilTransformsFinished()
  {
    return this.delay(Math.max(0, this.latestTransformEndTime - this.time.current));
  }

  fadeTo(alpha: number, duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.transformTo("alpha", alpha, duration, easing);
  }

  fadeIn(duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.fadeTo(1, duration, easing);
  }

  fadeInFromZero(duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.fadeTo(0).fadeIn(duration, easing);
  }

  fadeOut(duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.fadeTo(0, duration, easing);
  }

  fadeOutFromOne(duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.fadeTo(1).fadeOut(duration, easing);
  }

  fadeColor(color: ColorSource, duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.transformTo("color", new Color(color), duration, easing);
  }

  flashColorTo(color: ColorSource, duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    const endValue = this.color;
    return this.fadeColor(color, duration, easing).fadeColor(endValue, duration, easing);
  }

  moveTo(newPosition: Vec2, duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.transformTo("position", newPosition, duration, easing);
  }

  moveToX(newX: number, duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.transformTo("x", newX, duration, easing, "position");
  }

  moveToY(newY: number, duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.transformTo("y", newY, duration, easing, "position");
  }

  moveToOffset(offset: Vec2, duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    const result = new TransformSequence(this);
    const transform = this.populateTransform(new PositionOffsetTransform<this>(offset), new Vec2(), duration, easing);

    result.add(transform);
    this.addTransform(transform);

    return result.asProxy();
  }

  rotateTo(newRotation: number, duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.transformTo("rotation", newRotation, duration, easing);
  }

  scaleTo(newScale: number | Vec2, duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    if (typeof newScale === "number")
      newScale = new Vec2(newScale);

    return this.transformTo("scale", newScale, duration, easing);
  }

  resizeTo(newSize: number | Vec2, duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    if (typeof newSize === "number")
      newSize = new Vec2(newSize);

    return this.transformTo("size", newSize, duration, easing);
  }

  resizeWidthTo(newWidth: number, duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.transformTo("width", newWidth, duration, easing, "size");
  }

  resizeHeightTo(newHeight: number, duration = 0, easing: EasingFunction = EasingFunction.Default)
  {
    return this.transformTo("height", newHeight, duration, easing, "size");
  }

  transformTo<TProperty extends string & keyof this>(
    propertyOrFieldName: TProperty,
    newValue: this[TProperty],
    duration = 0,
    easing: EasingFunction = EasingFunction.Default,
    grouping?: string,
  ): TransformSequenceProxy<this>
  {
    const result = new TransformSequence(this);
    const transform = this.makeTransform(propertyOrFieldName, newValue, duration, easing, grouping);

    result.add(transform);
    this.addTransform(transform);

    return result.asProxy();
  }

  transformBindableTo<TValue>(
    targetBindable: Bindable<TValue>,
    newValue: TValue,
    duration: number,
    easing: EasingFunction = EasingFunction.Default,
  )
  {
    const result = new TransformSequence(this);

    const transform = this.populateTransform<TValue>(
        new TransformBindable(targetBindable),
        newValue,
        duration,
        easing,
    );

    result.add(transform);
    this.addTransform(transform);

    return result.asProxy();
  }

  protected makeTransform<TValue>(
    propertyOrFieldName: string,
    newValue: TValue,
    duration: number,
    easing: EasingFunction,
    grouping?: string,
  )
  {
    return this.populateTransform<TValue>(
        new TransformCustom(propertyOrFieldName, grouping),
        newValue,
        duration,
        easing,
    );
  }

  protected populateTransform<TValue>(
    transform: TypedTransform<TValue, this>,
    newValue: TValue,
    duration: number,
    easing: EasingFunction = EasingFunction.Default,
  )
  {
    if (duration < 0)
      throw new Error("Duration must be greater than or equal to 0");

    if (transform.target)
    {
      throw new Error("Transform already has a target");
    }

    transform.target = this;

    const startTime = this.transformStartTime;

    transform.startTime = startTime;
    transform.endTime = startTime + duration;
    transform.endValue = newValue;
    transform.easing = easing;

    return transform;
  }

  // #endregion

  // region InvalidationState

  #selfInvalidation = Invalidation.All;
  #parentInvalidation = Invalidation.All;
  #childInvalidation = Invalidation.All;

  #invalidate(flags: Invalidation, source: InvalidationSource): boolean
  {
    switch (source)
    {
    case InvalidationSource.Self:
      return this.#invalidateSelf(flags);
    case InvalidationSource.Parent:
      return this.#invalidateParent(flags);
    case InvalidationSource.Child:
      return this.#invalidateChild(flags);
    default:
      throw new Error(`Invalid InvalidationSource: ${source}`);
    }
  }

  #invalidateSelf(flags: Invalidation): boolean
  {
    const combined = this.#selfInvalidation | (flags & Invalidation.Layout);
    const result = (this.#selfInvalidation & flags) !== flags;
    this.#selfInvalidation = combined;
    return result;
  }

  #invalidateParent(flags: Invalidation): boolean
  {
    const combined = this.#parentInvalidation | (flags & Invalidation.Layout);
    const result = (this.#parentInvalidation & flags) !== flags;
    this.#parentInvalidation = combined;
    return result;
  }

  #invalidateChild(flags: Invalidation): boolean
  {
    const result = (this.#childInvalidation & flags) !== flags;
    this.#childInvalidation |= flags & Invalidation.Layout;
    return result;
  }

  #validate(flags: Invalidation)
  {
    const anyValidated = ((this.#selfInvalidation | this.#parentInvalidation | this.#childInvalidation) & flags) !== flags;

    flags = ~flags;

    this.#selfInvalidation &= flags;

    this.#parentInvalidation &= flags;

    this.#childInvalidation &= flags;

    return anyValidated;
  }

  // endregion
}

export function loadDrawable(drawable: Drawable, clock: IFrameBasedClock, dependencies: ReadonlyDependencyContainer)
{
  drawable[LOAD](clock, dependencies);
}

export function loadDrawableFromAsync(
  drawable: Drawable,
  clock: IFrameBasedClock,
  dependencies: ReadonlyDependencyContainer,
  isDirectAsyncContext: boolean,
): Promise<boolean>
{
  return drawable[LOAD_FROM_ASYNC](clock, dependencies, isDirectAsyncContext);
}

export enum LoadState
{
  NotLoaded = 0,
  Loading = 1,
  Ready = 2,
  Loaded = 3,
}

export enum Invalidation
{
  Transform = 1,
  DrawSize = 1 << 1,
  Color = 1 << 2,
  Presence = 1 << 3,
  Parent = 1 << 4,

  Layout = Transform | DrawSize,
  RequiredParentSizeToFit = Transform | DrawSize,
  All = Transform | RequiredParentSizeToFit | Color | Presence,
  None = 0,
}

export enum InvalidationSource
{
  Self = 1,
  Parent = 1 << 1,
  Child = 1 << 2,
  Default = Self | Parent,
}
