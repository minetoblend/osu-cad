import {
  Anchor,
  Axes,
  Bindable,
  Color,
  CompositeDrawable,
  DrawableSprite,
  EasingFunction,
  type ReadonlyDependencyContainer,
  resolved,
} from 'osucad-framework';
import { OsucadConfigManager } from '../../../../config/OsucadConfigManager';
import { OsucadSettings } from '../../../../config/OsucadSettings';
import { ArmedState } from '../../../../hitObjects/drawables/ArmedState';
import { DrawableHitObject } from '../../../../hitObjects/drawables/DrawableHitObject';
import { ISkinSource } from '../../../../skinning/ISkinSource';
import { DrawableComboNumber } from './DrawableComboNumber';

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

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

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

      this.hitAnimationsEnabled.valueChanged.addListener(() => this.schedule(() => this.#updateStateTransforms(this.drawableHitObject!)));
    }
  }

  comboNumber: DrawableComboNumber | null = null;

  #updateStateTransforms(hitObject: DrawableHitObject) {
    this.applyTransformsAt(-Number.MAX_VALUE, true);
    this.clearTransformsAfter(-Number.MAX_VALUE, true);

    this.#circleSprite.alpha = 1;
    this.#overlaySprite.alpha = 1;

    this.absoluteSequence(hitObject.hitStateUpdateTime, () => {
      switch (hitObject.state.value) {
        case ArmedState.Hit:
          if (this.hitAnimationsEnabled.value) {
            this.#circleSprite.fadeOut(240);
            this.#circleSprite.scaleTo(1.4, 240, EasingFunction.Out);

            this.#overlaySprite.fadeOut(240);
            this.#overlaySprite.scaleTo(1.4, 240, EasingFunction.Out);

            if (this.comboNumber)
              this.comboNumber.fadeOut(50);
          }
          else {
            this.fadeOutFromOne(700);
          }

          break;
      }
    });
  }

  override update() {
    super.update();

    if (this.time.current >= this.drawableHitObject!.hitStateUpdateTime) {
      this.#circleSprite.color = 0xFFFFFF;
    }
    else {
      this.#circleSprite.color = this.accentColor.value;
    }
  }

  override dispose(isDisposing?: boolean) {
    super.dispose(isDisposing);

    this.drawableHitObject?.applyCustomUpdateState.removeListener(this.#updateStateTransforms);
  }
}
