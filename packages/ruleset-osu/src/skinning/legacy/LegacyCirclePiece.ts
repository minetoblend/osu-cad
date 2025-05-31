import { ArmedState, DrawableHitObject, ISkinSource, SkinnableSpriteText } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, Bindable, CompositeDrawable, Container, DrawableSprite, EasingFunction, resolved, watch, withEffectScope } from "@osucad/framework";
import { Color } from "pixi.js";
import { OsuSkinComponents } from "../OsuSkinComponents";
import { DrawableOsuHitObject } from "../../hitObjects/drawables/DrawableOsuHitObject";
import { OsuHitObject } from "../../hitObjects/OsuHitObject";

export class LegacyCirclePiece extends CompositeDrawable
{
  @resolved(ISkinSource)
  private skin!: ISkinSource;

  @resolved(DrawableHitObject)
  protected drawableHitObject!: DrawableHitObject;

  private readonly indexInCurrentCombo: Bindable<number> = new Bindable(0);

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
  private hitCircleText?: SkinnableSpriteText;

  readonly accentColor = new Bindable(new Color(0xffffff));

  @withEffectScope()
  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    const circleName = this.#priorityLookup && this.skin.getTexture(this.#priorityLookup) ? this.#priorityLookup : "hitcircle";

    const maxSize = OsuHitObject.OBJECT_DIMENSIONS.scale(2);

    this.internalChildren = [
      this.circleSprite = new DrawableSprite({
        texture: this.skin.getTexture(circleName)?.withMaximumSize(maxSize),
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.overlayLayer = new Container({
        anchor: Anchor.Center,
        origin: Anchor.Center,
        child: this.overlaySprite = new DrawableSprite({
          texture: this.skin.getTexture(`${circleName}overlay`)?.withMaximumSize(maxSize),
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
      }),
    ];

    if (this.hasNumber)
    {
      this.overlayLayer.add(this.hitCircleText = new SkinnableSpriteText(OsuSkinComponents.HitCircleText).with({
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }));

      watch(() => this.skin.getConfig("hitCircleOverlayAboveNumber") ?? true,
          value => this.overlayLayer.changeChildDepth(this.overlaySprite, value ? -Number.MAX_VALUE : 0),
          { immediate: true },
      );
    }

    if (this.drawableHitObject instanceof DrawableOsuHitObject)
      this.indexInCurrentCombo.bindTo(this.drawableHitObject.indexInComboBindable);
  }


  protected override loadComplete()
  {
    super.loadComplete();

    this.drawableHitObject.applyCustomUpdateState.addListener(this.updateStateTransforms, this);
    this.updateStateTransforms(this.drawableHitObject, this.drawableHitObject.state);

    if (this.hasNumber)
      this.indexInCurrentCombo.bindValueChanged(index => this.hitCircleText!.text = `${index.value + 1}`, true);

    this.accentColor.bindTo(this.drawableHitObject.accentColor);
    this.accentColor.bindValueChanged(color => this.circleSprite.color = color.value, true);
  }

  private updateStateTransforms(drawable: DrawableHitObject, state: ArmedState)
  {
    this.applyTransformsAt(-Number.MAX_VALUE, true);
    this.clearTransformsAfter(-Number.MAX_VALUE, true);

    this.absoluteSequence({ time: this.drawableHitObject.hitStateUpdateTime, recursive: true }, () =>
    {
      switch (state)
      {
      case ArmedState.Hit:
        this.circleSprite.fadeOut(240);
        this.circleSprite.scaleTo(1.4, 240, EasingFunction.Out);

        this.overlaySprite.fadeOutFromOne(240);
        this.overlaySprite.scaleTo(1.4, 240, EasingFunction.Out);

        this.hitCircleText?.fadeOut(50);
        break;
      }
    });
  }

  public override dispose(isDisposing: boolean = true)
  {
    super.dispose(isDisposing);

    this.drawableHitObject.applyCustomUpdateState.removeListener(this.updateStateTransforms, this);
  }

  override updateDrawNodeTransform()
  {
    super.updateDrawNodeTransform();

    this.drawNode!.scale.copyFrom(this.drawScale);
  }
}
