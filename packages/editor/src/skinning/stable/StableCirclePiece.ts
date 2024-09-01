import {
  Anchor,
  Axes,
  Bindable,
  CompositeDrawable,
  DrawableSprite,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import type { ColorSource } from 'pixi.js';
import { ISkinSource } from '../ISkinSource';
import { DrawableComboNumber } from '../../editor/hitobjects/DrawableComboNumber';
import { DrawableHitObject } from '../../editor/hitobjects/DrawableHitObject';

export class StableCirclePiece extends CompositeDrawable {
  constructor(priorityLookupPrefix: string | null = null, readonly hasComboNumber: boolean = true) {
    super();

    this.#priorityLookup = priorityLookupPrefix;

    this.relativeSizeAxes = Axes.Both;
  }

  accentColor = new Bindable<ColorSource>(0xFFFFFF);

  readonly #priorityLookup: string | null = null;

  @resolved(DrawableHitObject, true)
  private drawableHitObject?: DrawableHitObject;

  @resolved(ISkinSource)
  private skin!: ISkinSource;

  #circle!: DrawableSprite;

  @dependencyLoader()
  load() {
    const circleName = this.#priorityLookup && this.skin.getTexture(this.#priorityLookup) ? this.#priorityLookup : 'hitcircle';

    this.addAllInternal(
      this.#circle = new DrawableSprite({
        texture: this.skin.getTexture(circleName),
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.#circle = new DrawableSprite({
        texture: this.skin.getTexture(`${circleName}overlay`),
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );

    if (this.hasComboNumber) {
      this.addInternal(new DrawableComboNumber());
    }

    if (this.drawableHitObject) {
      this.accentColor.bindTo(this.drawableHitObject.accentColor);

      this.drawableHitObject.applyCustomUpdateState.addListener(this.#updateColorTransforms, this);
    }

    this.accentColor.valueChanged.addListener(this.#updateColorTransforms, this);
  }

  override clearTransforms() {
  }

  override clearTransformsAfter() {
  }

  override applyTransformsAt() {
  }

  protected loadComplete() {
    super.loadComplete();

    this.#updateColorTransforms();
  }

  #updateColorTransforms() {
    this.#circle.clearTransforms(false, 'color');

    this.#circle.color = this.accentColor.value;

    if (!this.drawableHitObject?.hitObject)
      return;

    {
      using _ = this.#circle.beginAbsoluteSequence(this.drawableHitObject!.hitObject!.startTime, false);
      this.#circle.fadeColor(0xFFFFFF);
    }
  }

  dispose(isDisposing?: boolean) {
    super.dispose(isDisposing);

    this.drawableHitObject?.applyCustomUpdateState.removeListener(this.#updateColorTransforms);
  }
}
