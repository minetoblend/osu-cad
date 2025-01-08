import type {
  CompositeDrawable,
  Drawable,
  MarginPadding,
  MarginPaddingOptions,
  ReadonlyDependencyContainer,
} from 'osucad-framework';
import { Container, DependencyContainer, Invalidation } from 'osucad-framework';
import { Matrix } from 'pixi.js';

export class ProxyContainer extends Container {
  constructor(readonly source: CompositeDrawable) {
    super();
  }

  override get shouldBeAlive() {
    return !this.source.isDisposed && super.shouldBeAlive;
  }

  protected override loadComplete() {
    super.loadComplete();

    this.source.invalidated.addListener(this.#onSourceInvalidated, this);
  }

  #onSourceInvalidated([_, invalidation]: [Drawable, Invalidation]) {
    invalidation &= Invalidation.DrawSize;

    if (invalidation !== Invalidation.None) {
      this.invalidate(invalidation);
    }
  }

  override get padding(): MarginPadding {
    return this.source.padding;
  }

  override set padding(value: MarginPaddingOptions | undefined) {
    throw new Error('May not change padding on a ProxyContainer');
  }

  override get drawSize() {
    return this.source.drawSize;
  }

  override get childSize() {
    return this.source.childSize;
  }

  override get relativeChildSize() {
    return this.source.relativeChildSize;
  }

  override get relativeToAbsoluteFactor() {
    return this.source.relativeToAbsoluteFactor;
  }

  override get childOffset() {
    return this.source.childOffset;
  }

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    return new DependencyContainer(this.source.dependencies);
  }

  #matrix = new Matrix();

  override update() {
    super.update();

    this.invalidate(Invalidation.Transform);
  }

  override updateSubTreeTransforms(): boolean {
    this.updateDrawNodeTransform();

    for (const child of this.aliveInternalChildren) {
      child.updateSubTreeTransforms();
    }
    return true;
  }

  override updateDrawNodeTransform() {
    if (this.source.isDisposed)
      return;

    const transform = this.#matrix.copyFrom(this.parent!.drawNode.worldTransform).invert();
    transform.append(this.source.drawNode.worldTransform);

    transform.decompose(this.drawNode);
  }
}
