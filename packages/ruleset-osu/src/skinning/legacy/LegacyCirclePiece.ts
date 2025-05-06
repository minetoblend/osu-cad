import { DrawableHitObject, ISkinSource } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, Bindable, CompositeDrawable, DrawableSprite, EasingFunction, resolved } from "@osucad/framework";
import { LegacyComboNumber } from "./LegacyComboNumber";
import type { ComputedRef } from "@osucad/framework";
import { computed, watch, withEffectScope } from "@osucad/framework";
import { Color } from "pixi.js";

export class LegacyCirclePiece extends CompositeDrawable
{
  @resolved(ISkinSource)
  skin!: ISkinSource;

  @resolved(DrawableHitObject)
  hitObject!: DrawableHitObject;

  constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  private circleSprite!: DrawableSprite;
  private overlaySprite!: DrawableSprite;
  private comboNumber?: LegacyComboNumber;

  private hitCircleOverlayAboveNumber!: ComputedRef<boolean>;

  readonly accentColor = new Bindable(new Color(0xffffff));

  @withEffectScope()
  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.internalChildren = [
      this.circleSprite = new DrawableSprite({
        texture: this.skin.getTexture("hitcircle"),
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.overlaySprite = new DrawableSprite({
        texture: this.skin.getTexture("hitcircleoverlay"),
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.comboNumber = new LegacyComboNumber(),
    ];

    this.hitCircleOverlayAboveNumber = computed(() => this.skin.getConfig("hitCircleOverlayAboveNumber") ?? true);
  }


  @withEffectScope()
  protected override loadComplete()
  {
    super.loadComplete();

    this.hitObject.applyCustomUpdateState.addListener(this.applyCustomState, this);
    this.applyCustomState();

    this.accentColor.bindTo(this.hitObject.accentColor);
    this.accentColor.bindValueChanged(color => this.circleSprite.color = color.value, true);

    watch(this.hitCircleOverlayAboveNumber,
        value => this.changeInternalChildDepth(this.overlaySprite, value ? -Number.MAX_VALUE : 0),
        { immediate: true },
    );
  }

  private applyCustomState()
  {
    this.applyTransformsAt(-Number.MAX_VALUE, true);
    this.clearTransformsAfter(-Number.MAX_VALUE, true);

    this.absoluteSequence({ time: this.hitObject.hitStateUpdateTime, recursive: true }, () =>
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

    this.hitObject.applyCustomUpdateState.removeListener(this.applyCustomState, this);
  }
}
