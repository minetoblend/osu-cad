import { LegacyCirclePiece } from "./LegacyCirclePiece";
import { ProxyDrawable } from "@osucad/framework";
import { DrawableSliderHead } from "../../hitObjects/drawables/DrawableSliderHead";
import type { DrawableHitObject } from "@osucad/core";

export class LegacySliderHeadHitCircle extends LegacyCirclePiece
{
  constructor()
  {
    super("sliderstartcircle");
  }

  private proxiedOverlayLayer!: ProxyDrawable;

  protected override loadComplete(): void
  {
    super.loadComplete();


  }

  #hitObjectApplied(hitObject: DrawableHitObject)
  {
    const sliderHead = asSliderHead(hitObject);
    if (sliderHead)
    {
      this.proxiedOverlayLayer = new ProxyDrawable(this.overlayLayer);
      this.drawableHitObject.hitObjectApplied.addListener(this.#hitObjectApplied, this);

      sliderHead.drawableSlider?.overlayElementContainer.add(this.proxiedOverlayLayer.with({
        depth: -Number.MIN_VALUE,
      }));
    }

  }

  public override dispose(isDisposing: boolean = true): void
  {
    super.dispose(isDisposing);

    this.drawableHitObject.hitObjectApplied.removeListener(this.#hitObjectApplied, this);
  }
}

function asSliderHead(hitObject: DrawableHitObject): DrawableSliderHead | null
{
  if (hitObject instanceof DrawableSliderHead)
    return hitObject;

  return null;
}
