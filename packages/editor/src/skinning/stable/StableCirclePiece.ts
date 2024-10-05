import {
  Anchor,
  Axes,
  Bindable,
  Color,
  CompositeDrawable,
  dependencyLoader,
  DrawableSprite,
  resolved,
} from 'osucad-framework';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { DrawableComboNumber } from '../../editor/hitobjects/DrawableComboNumber';
import { DrawableHitObject } from '../../editor/hitobjects/DrawableHitObject';
import { ISkinSource } from '../ISkinSource';

export class StableCirclePiece extends CompositeDrawable {
  constructor(priorityLookupPrefix: string | null = null, readonly hasComboNumber: boolean = true) {
    super();

    this.#priorityLookup = priorityLookupPrefix;

    this.relativeSizeAxes = Axes.Both;
  }

  accentColor = new Bindable(new Color(0xFFFFFF));

  readonly #priorityLookup: string | null = null;

  @resolved(DrawableHitObject, true)
  private drawableHitObject?: DrawableHitObject;

  @resolved(ISkinSource)
  private skin!: ISkinSource;

  #circle!: DrawableSprite;

  @resolved(OsucadConfigManager)
  private config!: OsucadConfigManager;

  hitAnimationsEnabled = new Bindable(false);

  @dependencyLoader()
  load() {
    const circleName = this.#priorityLookup && this.skin.getTexture(this.#priorityLookup) ? this.#priorityLookup : 'hitcircle';

    this.addAllInternal(
      this.#circle = new DrawableSprite({
        texture: this.skin.getTexture(circleName),
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      new DrawableSprite({
        texture: this.skin.getTexture(`${circleName}overlay`),
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );

    this.config.bindWith(OsucadSettings.HitAnimations, this.hitAnimationsEnabled);

    if (this.hasComboNumber) {
      this.addInternal(this.comboNumber = new DrawableComboNumber());
    }

    if (this.drawableHitObject) {
      this.accentColor.bindTo(this.drawableHitObject.accentColor);

      this.drawableHitObject.applyCustomUpdateState.addListener(this.#updateColorTransforms, this);
    }

    this.accentColor.valueChanged.addListener(this.#updateColorTransforms, this);

    this.hitAnimationsEnabled.valueChanged.addListener(this.#updateColorTransforms, this);

    this.#updateColorTransforms();
  }

  comboNumber: DrawableComboNumber | null = null;

  override clearTransforms() {
  }

  override clearTransformsAfter() {
  }

  override applyTransformsAt() {
  }

  #updateColorTransforms() {
    super.clearTransforms();

    if (!this.drawableHitObject?.hitObject)
      return;

    const hitObject = this.drawableHitObject.hitObject;

    this.absoluteSequence(hitObject.startTime - hitObject.timePreempt, () => this.#updateInitialTransforms());
    this.absoluteSequence(hitObject.startTime, () => this.#updateStartTimeTransforms());
  }

  #updateInitialTransforms() {
    this.comboNumber?.fadeIn();
    this.#circle.fadeColor(this.accentColor.value);
  }

  #updateStartTimeTransforms() {
    if (this.hitAnimationsEnabled.value) {
      this.comboNumber?.fadeOut(50);
    }
    else {
      this.#circle.fadeColor(0xFFFFFF);
    }
  }

  dispose(isDisposing?: boolean) {
    super.dispose(isDisposing);

    this.drawableHitObject?.applyCustomUpdateState.removeListener(this.#updateColorTransforms);
  }
}
