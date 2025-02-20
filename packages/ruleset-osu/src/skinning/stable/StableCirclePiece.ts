import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { ArmedState, DrawableHitObject, ISkinSource, OsucadConfigManager, OsucadSettings } from '@osucad/core';
import { almostBigger, Anchor, Axes, Bindable, Color, CompositeDrawable, DrawableSprite, EasingFunction, resolved } from '@osucad/framework';
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
  }

  protected override loadComplete() {
    super.loadComplete();

    if (this.drawableHitObject) {
      this.accentColor.bindTo(this.drawableHitObject.accentColor);

      this.drawableHitObject.applyCustomUpdateState.addListener(this.#updateStateTransforms, this);

      this.hitAnimationsEnabled.bindValueChanged(() => this.schedule(() => this.#updateStateTransforms(this.drawableHitObject!)));

      this.#updateStateTransforms(this.drawableHitObject!);
    }
  }

  comboNumber: DrawableComboNumber | null = null;

  #updateStateTransforms(hitObject: DrawableHitObject) {
    this.applyTransformsAt(-Number.MAX_VALUE, true);
    this.clearTransformsAfter(-Number.MAX_VALUE, true);

    this.absoluteSequence({ time: hitObject.hitStateUpdateTime, recursive: true }, () => {
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

    if (almostBigger(this.time.current, this.drawableHitObject!.hitStateUpdateTime)) {
      this.#circleSprite.color = 0xFFFFFF;
    }
    else {
      this.#circleSprite.color = this.accentColor.value;
    }
  }

  override dispose(isDisposing?: boolean) {
    super.dispose(isDisposing);

    this.drawableHitObject?.applyCustomUpdateState.removeListener(this.#updateStateTransforms, this);
  }

  protected override updateTransforms() {
    if (this.drawableHitObject!.hitObject!.startTime === 3518)
      debugger;

    super.updateTransforms();
  }
}
