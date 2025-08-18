import { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";
import type { Slider } from "../../../hitObjects";
import { Anchor, Bindable, dependencyLoader, Vec2 } from "@osucad/framework";
import { OsuSkinComponents } from "../../../skinning";
import type { DrawableHitObject } from "@osucad/core";
import { SkinnableDrawable } from "@osucad/core";
import { DrawableSlider } from "../../../hitObjects/drawables/DrawableSlider";
import { Color } from "pixi.js";

export class SliderSelectionBlueprint extends HitObjectSelectionBlueprint<Slider>
{
  #sliderHead!: SkinnableDrawable;
  #sliderTail!: SkinnableDrawable;

  readonly scaleBindable = new Bindable(1);
  readonly positionBindable = new Bindable(new Vec2());
  readonly stackHeightBindable = new Bindable(0);

  @dependencyLoader()
  #load()
  {
    this.addRangeInternal([
      this.#sliderTail = new SkinnableDrawable(OsuSkinComponents.HitCircleSelect).with({
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.#sliderHead = new SkinnableDrawable(OsuSkinComponents.HitCircleSelect).with({
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    ]);

    this.scaleBindable.bindTo(this.hitObject.scaleBindable);
    this.positionBindable.bindTo(this.hitObject.positionBindable);
    this.stackHeightBindable.bindTo(this.hitObject.stackHeightBindable);
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.scaleBindable.bindValueChanged(e => this.#sliderHead.scale = this.#sliderTail.scale = e.value, true);
    this.positionBindable.bindValueChanged(e => this.position = this.hitObject.stackedPosition, true);
    this.stackHeightBindable.bindValueChanged(e => this.position = this.hitObject.stackedPosition);

    this.hitObject.defaultsApplied.addListener(this.#updateTail, this);
    this.#updateTail();
  }

  #updateTail()
  {
    this.#sliderTail.position = this.hitObject.path.positionAt(1);
  }

  #drawableSlider?: DrawableSlider;

  public override setSelected(selected: boolean): void
  {
    super.setSelected(selected);

    this.#updateSelection();
  }

  #updateSelection()
  {
    if (!this.#drawableSlider)
      return;

    if (this.selected)
    {
      this.#drawableSlider.sliderBody!.borderColor = new Color(0x2d87fc);
    }
    else
    {
      this.#drawableSlider.sliderBody!.borderColor = new Color(0xffffff);
    }
  }

  override drawableBecameAlive(drawableHitObject: DrawableHitObject)
  {
    if (drawableHitObject instanceof DrawableSlider)
      this.#drawableSlider = drawableHitObject;

    this.#updateSelection();
  }

  override drawableBecameDead(drawableHitObject: DrawableHitObject)
  {
    this.#drawableSlider = undefined;
  }


  override containsLocal(position: Vec2): boolean
  {
    return this.hitObject.contains(position.add(this.position));
  }

  override dispose()
  {
    this.hitObject.defaultsApplied.removeListener(this.#updateTail, this);
    super.dispose();
  }
}
