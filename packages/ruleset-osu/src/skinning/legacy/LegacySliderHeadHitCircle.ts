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

    if (this.drawableHitObject && this.drawableHitObject instanceof DrawableSliderHead)
    {
      this.proxiedOverlayLayer = new ProxyDrawable(this.overlayLayer);
      this.drawableHitObject.hitObjectApplied.addListener(this.#hitObjectApplied, this);
      this.drawableHitObject.hitObjectFreed.addListener(this.#hitObjectFreed, this);
    }
  }

  #hitObjectApplied(hitObject: DrawableHitObject)
  {
    asSliderHead(hitObject)?.drawableSlider?.overlayElementContainer.add(this.proxiedOverlayLayer.with({
      depth: -Number.MAX_VALUE,
    }));
  }

  #hitObjectFreed(hitObject: DrawableHitObject)
  {
    asSliderHead(hitObject)?.drawableSlider?.overlayElementContainer.remove(this.proxiedOverlayLayer, false);
  }

  public override dispose(isDisposing: boolean = true): void
  {
    super.dispose(isDisposing);

    this.drawableHitObject.hitObjectApplied.addListener(this.#hitObjectApplied, this);
    this.drawableHitObject.hitObjectFreed.addListener(this.#hitObjectFreed, this);
  }
}

function asSliderHead(hitObject: DrawableHitObject): DrawableSliderHead | null
{
  if (hitObject instanceof DrawableSliderHead)
    return hitObject;

  return null;
}
