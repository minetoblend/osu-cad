import type { Drawable } from "@osucad/framework";
import { ProxyDrawable } from "@osucad/framework";
import { Anchor, Bindable, dependencyLoader, Vec2 } from "@osucad/framework";
import type { HitCircle } from "../../../hitObjects";
import { OsuHitObject } from "../../../hitObjects";
import { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";
import type { DrawableHitObject } from "@osucad/core";
import { SkinnableDrawable } from "@osucad/core";
import { OsuSkinComponents } from "../../../skinning";
import { DrawableHitCircle } from "../../../hitObjects/drawables/DrawableHitCircle";

export class HitCircleSelectionBlueprint extends HitObjectSelectionBlueprint<HitCircle>
{
  readonly scaleBindable = new Bindable(1);
  readonly positionBindable = new Bindable(new Vec2());
  readonly stackHeightBindable = new Bindable(0);

  #content!: Drawable;

  @dependencyLoader()
  #load()
  {
    this.origin = Anchor.Center;
    this.size = OsuHitObject.OBJECT_DIMENSIONS;
    this.cornerRadius = OsuHitObject.OBJECT_RADIUS;

    this.scaleBindable.bindTo(this.hitObject.scaleBindable);
    this.positionBindable.bindTo(this.hitObject.positionBindable);
    this.stackHeightBindable.bindTo(this.hitObject.stackHeightBindable);

    this.internalChildren = [
      this.#content = new SkinnableDrawable(OsuSkinComponents.HitCircleSelect).with({
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    ];
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.scaleBindable.bindValueChanged(e => this.scale = e.value, true);
    this.positionBindable.bindValueChanged(e => this.position = this.hitObject.stackedPosition, true);
    this.stackHeightBindable.bindValueChanged(e => this.position = this.hitObject.stackedPosition);
  }

  #proxy: ProxyDrawable | null = null;
  #drawableHitObject: DrawableHitCircle | null = null;

  override drawableBecameAlive(drawableHitObject: DrawableHitObject)
  {
    if (drawableHitObject instanceof DrawableHitCircle)
    {
      this.#drawableHitObject = drawableHitObject;
      drawableHitObject.proxyLayer.add(this.#proxy = new ProxyDrawable(this));
    }
  }

  override drawableBecameDead(drawableHitObject: DrawableHitObject)
  {
    if (this.#proxy && drawableHitObject instanceof DrawableHitCircle)
    {
      this.#drawableHitObject = null;
      drawableHitObject.proxyLayer.remove(this.#proxy);
      this.#proxy = null;
    }
  }

  override dispose()
  {
    if (this.#proxy)
      this.#drawableHitObject?.proxyLayer.remove(this.#proxy);

    super.dispose();
  }
}
