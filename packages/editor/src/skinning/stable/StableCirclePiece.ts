import {
  Anchor,
  Axes,
  Bindable,
  Color,
  CompositeDrawable,
  dependencyLoader,
  DrawableSprite,
  EasingFunction,
  resolved,
} from 'osucad-framework';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { ArmedState } from '../../editor/hitobjects/ArmedState.ts';
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

  #circleSprite!: DrawableSprite;
  #overlaySprite!: DrawableSprite;

  @resolved(OsucadConfigManager)
  private config!: OsucadConfigManager;

  hitAnimationsEnabled = new Bindable(false);

  @dependencyLoader()
  load() {
    const circleName = this.#priorityLookup && this.skin.getTexture(this.#priorityLookup) ? this.#priorityLookup : 'hitcircle';

    this.addAllInternal(
      this.#circleSprite = new DrawableSprite({
        texture: this.skin.getTexture(circleName),
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.#overlaySprite = new DrawableSprite({
        texture: this.skin.getTexture(`${circleName}overlay`),
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );

    this.config.bindWith(OsucadSettings.HitAnimations, this.hitAnimationsEnabled);

    if (this.hasComboNumber)
      this.addInternal(this.comboNumber = new DrawableComboNumber());

    if (this.drawableHitObject) {
      this.accentColor.bindTo(this.drawableHitObject.accentColor);

      this.drawableHitObject.applyCustomUpdateState.addListener(this.#updateStateTransforms, this);

      // this.accentColor.valueChanged.addListener(() => this.#updateStateTransforms(this.drawableHitObject!));

      this.hitAnimationsEnabled.valueChanged.addListener(() => this.#updateStateTransforms(this.drawableHitObject!));
    }

    this.accentColor.addOnChangeListener(() => this.#circleSprite.color = this.accentColor.value, { immediate: true });
  }

  comboNumber: DrawableComboNumber | null = null;

  #updateStateTransforms(hitObject: DrawableHitObject) {
    this.applyTransformsAt(Number.MIN_VALUE, true);
    this.clearTransformsAfter(Number.MIN_VALUE, true);

    this.#circleSprite.alpha = 1;
    this.#overlaySprite.alpha = 1;

    this.absoluteSequence(hitObject.hitStateUpdateTime, () => {
      switch (hitObject.state.value) {
        case ArmedState.Hit:
          this.#circleSprite.fadeOut(240);
          this.#circleSprite.scaleTo(1.4, 240, EasingFunction.Out);

          this.#overlaySprite.fadeOut(240);
          this.#overlaySprite.scaleTo(1.4, 240, EasingFunction.Out);

          if (this.comboNumber)
            this.comboNumber.fadeOut(50);

          break;
      }
    });
  }

  dispose(isDisposing?: boolean) {
    super.dispose(isDisposing);

    this.drawableHitObject?.applyCustomUpdateState.removeListener(this.#updateStateTransforms);
  }
}
