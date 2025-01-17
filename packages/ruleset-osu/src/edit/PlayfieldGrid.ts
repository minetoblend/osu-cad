import type { Bindable, IKeyBindingHandler, KeyBindingAction, KeyDownEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import type { IPositionSnapProvider } from './IPositionSnapProvider';
import { EditorAction, IBeatmap } from '@osucad/core';
import { almostBigger, BindableBoolean, BindableNumber, Cached, CompositeDrawable, definitelyBigger, Key, resolved, Vec2 } from '@osucad/framework';
import { Graphics } from 'pixi.js';
import { SnapResult } from './IPositionSnapProvider';

export class PlayfieldGrid extends CompositeDrawable implements IKeyBindingHandler<EditorAction>, IPositionSnapProvider {
  constructor(
    gridSnapEnabled?: Bindable<boolean>,
  ) {
    super();

    this.size = new Vec2(512, 384);
    if (gridSnapEnabled)
      this.gridSnapEnabled.bindTo(gridSnapEnabled);
  }

  readonly gridSnapEnabled = new BindableBoolean(false);

  readonly gridSizeBindable = new BindableNumber(64);

  readonly graphics = new Graphics();

  readonly #graphicsCache = new Cached();

  #pixelSize = 1;

  @resolved(IBeatmap, true)
  beatmap?: IBeatmap;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    if (this.beatmap)
      this.gridSizeBindable.bindTo(this.beatmap.beatmapInfo.gridSizeBindable);

    this.drawNode.addChild(this.graphics);

    this.gridSizeBindable.valueChanged.addListener(() => this.#graphicsCache.invalidate());
  }

  override update() {
    super.update();

    if (!this.#graphicsCache.isValid) {
      this.#updateGraphics(this.graphics);
      this.#graphicsCache.validate();
    }
  }

  #updateGraphics(g: Graphics) {
    g.clear();

    g.rect(0, 0, 512, 384).stroke({
      color: 0xFFFFFF,
      alpha: 0.25,
      width: 2 / this.#pixelSize,
    });

    const size = this.gridSizeBindable.value;

    if (!definitelyBigger(size, 0))
      return;

    g.beginPath();
    for (let i = size; i <= 512 - size; i += size) {
      if (i === 256)
        continue;
      g.moveTo(i, 0).lineTo(i, 384);
    }

    for (let i = size; i <= 384 - size; i += size) {
      if (i === 192)
        continue;
      g.moveTo(0, i).lineTo(512, i);
    }

    g.stroke({
      color: 0xFFFFFF,
      alpha: 0.125,
      width: 1 / this.#pixelSize,
    });

    g.moveTo(256, 0)
      .lineTo(256, 384)
      .moveTo(0, 192)
      .lineTo(512, 192)
      .stroke({
        color: 0xFFFFFF,
        alpha: 0.15,
        width: 2 / this.#pixelSize,
      });
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof EditorAction;
  }

  snapPosition(position: Vec2): SnapResult | null {
    if (!this.gridSnapEnabled.value || !almostBigger(this.gridSizeBindable.value, 0))
      return null;

    const size = this.gridSizeBindable.value;

    const x = Math.round(position.x / size) * size;
    const y = Math.round(position.y / size) * size;

    return new SnapResult(position, new Vec2(x, y));
  }

  override updateSubTreeTransforms(): boolean {
    if (!super.updateSubTreeTransforms())
      return false;

    const pixelSize = this.drawNode.worldTransform.a;

    if (pixelSize === this.#pixelSize)
      return true;

    this.#pixelSize = pixelSize;
    this.#graphicsCache.invalidate();

    return true;
  }

  #gridSizePresets = [4, 8, 16, 32, 64];

  override onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.Digit0 && e.controlPressed) {
      this.gridSizeBindable.value = 0;
      return true;
    }

    if (e.key.startsWith('Digit') && e.controlPressed) {
      const index = Number.parseInt(e.key[5]) - 1;
      if (index >= 0 && index < this.#gridSizePresets.length) {
        this.gridSizeBindable.value = this.#gridSizePresets[index];
        return true;
      }
    }

    return false;
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.graphics.destroy();
  }
}
