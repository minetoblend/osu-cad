import { DrawableHitObject, ISkinSource } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, Bindable, CompositeDrawable, Container, DrawableSprite, EasingFunction, resolved, watch, withEffectScope } from "@osucad/framework";
import { LegacyComboNumber } from "./LegacyComboNumber";
import { Color } from "pixi.js";

export class LegacyCirclePiece extends CompositeDrawable
{
  @resolved(ISkinSource)
  private skin!: ISkinSource;

  @resolved(DrawableHitObject)
  protected drawableHitObject!: DrawableHitObject;

  constructor(
    priorityLookupPrefix: string | null = null,
    readonly hasNumber: boolean = true,
  )
  {
    super();

    this.#priorityLookup = priorityLookupPrefix;
    this.relativeSizeAxes = Axes.Both;
  }

  readonly #priorityLookup: string | null = null;

  private circleSprite!: DrawableSprite;
  private overlaySprite!: DrawableSprite;
  protected overlayLayer!: Container;
  private comboNumber?: LegacyComboNumber;

  readonly accentColor = new Bindable(new Color(0xffffff));

  @withEffectScope()
  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    const circleName = this.#priorityLookup && this.skin.getTexture(this.#priorityLookup) ? this.#priorityLookup : "hitcircle";

    this.internalChildren = [
      this.circleSprite = new DrawableSprite({
        texture: this.skin.getTexture(circleName),
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.overlayLayer = new Container({
        anchor: Anchor.Center,
        origin: Anchor.Center,
        child: this.overlaySprite = new DrawableSprite({
          texture: this.skin.getTexture(`${circleName}overlay`),
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
      }),
    ];

    if (this.hasNumber)
    {
      this.overlayLayer.add(this.comboNumber = new LegacyComboNumber());

      watch(() => this.skin.getConfig("hitCircleOverlayAboveNumber") ?? true,
          value => this.overlayLayer.changeChildDepth(this.overlaySprite, value ? -Number.MAX_VALUE : 0),
          { immediate: true },
      );
    }
  }


  protected override loadComplete()
  {
    super.loadComplete();

    this.drawableHitObject.applyCustomUpdateState.addListener(this.applyCustomState, this);
    this.applyCustomState();

    this.accentColor.bindTo(this.drawableHitObject.accentColor);
    this.accentColor.bindValueChanged(color => this.circleSprite.color = color.value, true);
  }

  private applyCustomState()
  {
    this.applyTransformsAt(-Number.MAX_VALUE, true);
    this.clearTransformsAfter(-Number.MAX_VALUE, true);

    this.absoluteSequence({ time: this.drawableHitObject.hitStateUpdateTime, recursive: true }, () =>
    {
      this.circleSprite.fadeOut(240);
      this.circleSprite.scaleTo(1.4, 240, EasingFunction.Out);

      this.overlaySprite.fadeOutFromOne(240);
      this.overlaySprite.scaleTo(1.4, 240, EasingFunction.Out);

      this.comboNumber?.fadeOut(50);
    });
  }

  public override dispose(isDisposing: boolean = true)
  {
    super.dispose(isDisposing);

    this.drawableHitObject.applyCustomUpdateState.removeListener(this.applyCustomState, this);
  }
}
