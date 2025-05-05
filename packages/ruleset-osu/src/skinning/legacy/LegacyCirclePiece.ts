import { DrawableHitObject, ISkinSource } from "@osucad/core";
import { Anchor, Axes, Bindable, CompositeDrawable, DrawableSprite, EasingFunction, ReadonlyDependencyContainer, resolved } from "@osucad/framework";
import { LegacyComboNumber } from "./LegacyComboNumber";

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

  private hitCircleOverlayAboveNumber!: Bindable<boolean | null>;

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

    this.hitCircleOverlayAboveNumber = this.skin.getConfigBindable("hitCircleOverlayAboveNumber");
  }


  protected override loadComplete() 
  {
    super.loadComplete();

    this.hitObject.applyCustomUpdateState.addListener(this.applyCustomState, this);
    this.applyCustomState();

    this.hitCircleOverlayAboveNumber.bindValueChanged(
        e => this.changeInternalChildDepth(this.overlaySprite, (e.value ?? true) ? -Number.MAX_VALUE : 0),
        true,
    );
  }

  private applyCustomState() 
  {
    this.applyTransformsAt(-Number.MAX_VALUE, true);
    this.clearTransformsAfter(-Number.MAX_VALUE, true);

    this.circleSprite.color = this.hitObject.accentColor.value;

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
