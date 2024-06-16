import { Container } from 'pixi.js';
import type { SuspenseContainer } from '../SuspenseContainer';
import { DependencyContainer } from '../di/DependencyContainer';
import { getDependencyLoaders, getInjections } from '../di/DependencyLoader';
import { IVec2, Vec2 } from '@osucad/common';
import { Axes } from './Axes';
import { CompositeDrawable } from './CompositeDrawable';
import { Invalidation, InvalidationSource } from './Invalidation';
import { LoadState } from './LoadState';
import { MarginPadding } from './MarginPadding';
import { Anchor } from './Anchor';
import { MouseDownEvent } from '../input/events/MouseEvent';
import { UIEvent } from '../input/events/UIEvent';
import { InputManager } from '@/framework/input/InputManager.ts';

export interface DrawableOptions {
  position?: IVec2;
  size?: IVec2;
  width?: number;
  height?: number;
  scale?: IVec2;
  margin?: MarginPadding;
  relativeSizeAxes?: Axes;
  origin?: Anchor;
  anchor?: Anchor;
  customAnchor?: IVec2;
  customOrigin?: IVec2;
  alpha?: number;
}

export abstract class Drawable {
  constructor(options: DrawableOptions = {}) {
    if (options.position) this.position.copyFrom(options.position);
    if (options.size) this.size.copyFrom(options.size);
    if (options.width) this.width = options.width;
    if (options.height) this.height = options.height;
    if (options.scale) this.scale.copyFrom(options.scale);
    if (options.margin) this.margin = options.margin;
    if (options.relativeSizeAxes)
      this.relativeSizeAxes = options.relativeSizeAxes;
    if (options.origin) this.origin = options.origin;
    if (options.anchor) this.anchor = options.anchor;
    if (options.customAnchor) this.#customAnchor.copyFrom(options.customAnchor);
    if (options.customOrigin) this.#customOrigin.copyFrom(options.customOrigin);
    if (options.alpha !== undefined) this.alpha = options.alpha;
  }

  _parent?: CompositeDrawable;

  get parent() {
    return this._parent;
  }

  #size = new Vec2(1, 1);

  get size() {
    return this.#size;
  }

  set size(value: Vec2) {
    this.#size.copyFrom(value);
    this.invalidate(Invalidation.DrawSize, InvalidationSource.Self, false);
  }

  get width() {
    return this.#size.x;
  }

  set width(value: number) {
    if (value !== this.width) {
      this.#size.x = value;
      this.invalidate(Invalidation.DrawSize, InvalidationSource.Self, false);
    }
  }

  get height() {
    return this.#size.y;
  }

  set height(value: number) {
    if (value !== this.height) {
      this.#size.y = value;
      this.invalidate(Invalidation.DrawSize, InvalidationSource.Self, false);
    }
  }

  #scale = new Vec2(1, 1);

  get scale() {
    return this.#scale;
  }

  set scale(value: Vec2) {
    this.#scale.copyFrom(value);
    this.invalidate(Invalidation.Transform, InvalidationSource.Self, false);
  }

  receivePositionalInputAt(screenSpacePos: Vec2) {
    return this.contains(screenSpacePos);
  }

  contains(screenSpacePos: Vec2) {
    const local = this.toLocalSpace(screenSpacePos);

    return (
      local.x >= 0 &&
      local.x <= this.drawSize.x &&
      local.y >= 0 &&
      local.y <= this.drawSize.y
    );
  }

  toLocalSpace(screenSpacePos: Vec2) {
    return Vec2.from(this.drawNode.toLocal(screenSpacePos));
  }

  #drawSize?: Vec2;

  private computeDrawSize(): Vec2 {
    const size = this.#size.clone();

    if (this.#relativeSizeAxes !== Axes.None && this.parent) {
      if (this.#relativeSizeAxes & Axes.X)
        size.x *= this.parent.childSize.x - this.margin.horizontal;
      if (this.#relativeSizeAxes & Axes.Y)
        size.y *= this.parent.childSize.y - this.margin.vertical;
    }

    return size;
  }

  get drawSize() {
    this.#drawSize ??= this.computeDrawSize();
    return this.#drawSize;
  }

  #position = new Vec2(0, 0);

  get position() {
    return this.#position;
  }

  set position(value: Vec2) {
    this.#position.copyFrom(value);
    this.invalidate(Invalidation.Transform, InvalidationSource.Self, false);
  }

  #margin = MarginPadding.default();

  #relativeSizeAxes = Axes.None;

  get relativeSizeAxes() {
    return this.#relativeSizeAxes;
  }

  set relativeSizeAxes(value: Axes) {
    this.#relativeSizeAxes = value;
    this.invalidate(Invalidation.DrawSize, InvalidationSource.Self, false);
  }

  get margin() {
    return this.#margin;
  }

  set margin(value: MarginPadding) {
    this.#margin = value;
    this.invalidate(
      Invalidation.Transform | Invalidation.DrawSize,
      InvalidationSource.Self,
      false,
    );
  }

  #origin = Anchor.TopLeft;

  get origin() {
    return this.#origin;
  }

  set origin(value: Anchor) {
    this.#origin = value;
    this.invalidate(Invalidation.Transform, InvalidationSource.Self, false);
  }

  #anchor = Anchor.TopLeft;

  get anchor() {
    return this.#anchor;
  }

  set anchor(value: Anchor) {
    this.#anchor = value;
    this.invalidate(Invalidation.Transform, InvalidationSource.Self, false);
  }

  #customAnchor = new Vec2(0, 0);

  get customAnchor() {
    return this.#customAnchor;
  }

  get anchorPosition() {
    if (this.anchor === Anchor.Custom) {
      return this.customAnchor;
    }

    const position = new Vec2(0, 0);

    if (this.anchor & Anchor.y1) {
      position.y = this.drawSize.y * 0.5;
    } else if (this.anchor & Anchor.y2) {
      position.y = this.drawSize.y;
    }

    if (this.anchor & Anchor.x1) {
      position.x = this.drawSize.x * 0.5;
    } else if (this.anchor & Anchor.x2) {
      position.x = this.drawSize.x;
    }

    return position;
  }

  #customOrigin = new Vec2(0, 0);

  get customOrigin() {
    return this.#customOrigin;
  }

  get relativeOriginPosition() {
    if (this.#origin === Anchor.Custom) {
      return this.#customOrigin;
    }

    const position = new Vec2(0, 0);

    if (this.#origin & Anchor.y1) {
      position.y = 0.5;
    } else if (this.#origin & Anchor.y2) {
      position.y = 1;
    }

    if (this.#origin & Anchor.x1) {
      position.x = 0.5;
    } else if (this.#origin & Anchor.x2) {
      position.x = 1;
    }

    return position;
  }

  get originPosition() {
    const position = this.relativeOriginPosition;

    if (!this.parent) {
      return position;
    }

    return new Vec2(
      this.parent.childOffset.x + this.parent.childSize.x * position.x,
      this.parent.childOffset.y + this.parent.childSize.y * position.y,
    );
  }

  get drawPosition() {
    const position = this.#position.add(this.originPosition);

    position.x += this.margin.left;
    position.y += this.margin.top;

    return position;
  }

  abstract drawNode: Container;

  updateSubtree() {
    this.update();
  }

  update() {
    if (this.loadState === LoadState.NotLoaded) {
      this._load(this.parent!.dependencies);
    }
    if (this._invalidations !== Invalidation.None) {
      this.handleInvalidations();
      this._invalidations = Invalidation.None;
    }

    if (this.#loadState === LoadState.Ready) {
      this.#loadState = LoadState.Loaded;
    }

    this.onTick();
  }

  onTick() {
    // override
  }

  #loadState = LoadState.NotLoaded;

  get loadState() {
    return this.#loadState;
  }

  dependencies!: DependencyContainer;

  _load(dependencies: DependencyContainer) {
    this.#loadState = LoadState.Loading;
    this.dependencies = new DependencyContainer(dependencies);
    this.#injectDependencies();
    const dependencyLoaders = getDependencyLoaders(this);
    for (const key of dependencyLoaders) {
      const loader = this[key as keyof this] as () => void | Promise<void>;
      const result = loader.call(this);
      let suspenseBarrier: SuspenseContainer | false | undefined = false;
      if (result instanceof Promise) {
        if (suspenseBarrier === false) {
          suspenseBarrier = this.getSuspenseBarrier();
        }
        if (suspenseBarrier === undefined) {
          throw new Error('Suspense barrier not found');
        }
        suspenseBarrier.waitForDrawable(this, result);
      }
    }
    this.handleInvalidations();
    this.#loadState = LoadState.Ready;
    this.onLoaded();
  }

  #injectDependencies() {
    const injections = getInjections(this);
    for (const { key, type, optional } of injections) {
      Reflect.set(
        this,
        key,
        optional
          ? this.dependencies.resolveOptional(type)
          : this.dependencies.resolve(type),
      );
    }
  }

  _invalidations = Invalidation.All;

  invalidate(
    invalidation: Invalidation,
    source: InvalidationSource = InvalidationSource.Default,
    propagateToParent = false,
  ) {
    this._invalidations |= invalidation;
    if (propagateToParent && source !== InvalidationSource.Parent) {
      this._parent?.invalidate(invalidation, InvalidationSource.Child);
    }
  }

  handleInvalidations() {
    if (this._invalidations === Invalidation.DrawSize) {
      this.#drawSize = undefined;
      this.updateDrawSize();
    }
    if (this._invalidations & Invalidation.Transform) {
      this.updateDrawNodeTransform();
    }
  }

  get invalidationFromParentDrawsize() {
    if (this.#relativeSizeAxes !== Axes.None) return Invalidation.DrawSize;

    return Invalidation.None;
  }

  get requiredSizeToFit() {
    const size = this.size.clone();
    if (this.relativeSizeAxes & Axes.X) size.x = 0;
    if (this.relativeSizeAxes & Axes.Y) size.y = 0;
    return size;
  }

  updateDrawSize() {}

  updateDrawNodeTransform() {
    this.drawNode.position.copyFrom(this.drawPosition);
    this.drawNode.scale.copyFrom(this.#scale);
    this.drawNode.pivot.copyFrom(this.anchorPosition);
    this.drawNode.alpha = this.#alpha;
  }

  #alpha = 1;

  get alpha() {
    return this.#alpha;
  }

  set alpha(value: number) {
    this.#alpha = value;
    this.invalidate(Invalidation.Transform, InvalidationSource.Self, false);
  }

  findParentOfType<T extends Drawable>(
    type: new (...args: any[]) => T,
  ): T | undefined {
    let parent = this._parent;
    while (parent) {
      if (parent instanceof type) return parent;
      parent = parent._parent;
    }
    return undefined;
  }

  findParent(predicate: (drawable: Drawable) => boolean): Drawable | undefined {
    let parent = this._parent;
    while (parent) {
      if (predicate(parent)) return parent;
      parent = parent._parent;
    }
    return undefined;
  }

  protected getSuspenseBarrier(): SuspenseContainer | undefined {
    return this.findParent((drawable) => drawable.isSuspenseBarrier) as
      | SuspenseContainer
      | undefined;
  }

  isSuspenseBarrier = false;

  #present = true;

  get isPresent() {
    return this.#present;
  }

  set isPresent(value: boolean) {
    this.#present = value;
    this.drawNode.visible = value;
  }

  destroy() {
    this.parent?.removeInternal(this);
    this.drawNode.destroy();
  }

  canHaveChildren(): this is CompositeDrawable {
    return false;
  }

  // region events
  // @ts-expect-error - unused param.
  handle(event: UIEvent): boolean {
    return false;
  }

  onMouseDown(event: MouseDownEvent): boolean {
    return this.handle(event);
  }

  onMouseUp(event: MouseDownEvent): boolean {
    return this.handle(event);
  }

  onMouseMove(event: MouseDownEvent): boolean {
    return this.handle(event);
  }

  onHover(event: MouseDownEvent): boolean {
    return this.handle(event);
  }

  onHoverLost(event: MouseDownEvent): boolean {
    return this.handle(event);
  }

  onWheel(event: MouseDownEvent): boolean {
    return this.handle(event);
  }

  // @ts-expect-error - unused param.
  onGlobalKeyDown(event: KeyboardEvent) {}

  // @ts-expect-error - unused param.
  onGlobalKeyUp(event: KeyboardEvent) {}

  // @ts-expect-error - unused param.
  onKeyDown(event: KeyboardEvent): boolean {
    return false;
  }

  // @ts-expect-error - unused param.
  onKeyUp(event: KeyboardEvent): boolean {
    return false;
  }

  // endregion

  #hovered = false;

  get hovered() {
    return this.#hovered;
  }

  set hovered(value: boolean) {
    this.#hovered = value;
  }

  get zIndex() {
    return this.drawNode.zIndex;
  }

  set zIndex(value: number) {
    this.drawNode.zIndex = value;
  }

  receiveGlobalKeyboardEvents() {
    return false;
  }

  onLoaded() {
    if (this.receiveGlobalKeyboardEvents()) {
      this.dependencies.resolve(InputManager).addGlobalKeyboardReceiver(this);
    }
  }

  onRemoved() {
    if (this.receiveGlobalKeyboardEvents()) {
      this.dependencies
        .resolve(InputManager)
        .removeGlobalKeyboardReceiver(this);
    }
  }
}
