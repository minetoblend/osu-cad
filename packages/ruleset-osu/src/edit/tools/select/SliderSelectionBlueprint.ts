import type { DrawableHitObject, HitObjectLifetimeEntry } from "@osucad/core";
import { SkinnableDrawable } from "@osucad/core";
import { ComposeToolContainer } from "@osucad/editor";
import type { DragStartEvent, Rectangle } from "@osucad/framework";
import { Anchor, Bindable, dependencyLoader, ProxyDrawable, resolved, Vec2 } from "@osucad/framework";
import { Color } from "pixi.js";
import type { Slider } from "../../../hitObjects";
import { DrawableSlider } from "../../../hitObjects/drawables/DrawableSlider";
import { OsuSkinComponents } from "../../../skinning";
import { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";
import { MoveTool } from "../move/MoveTool";

export class SliderSelectionBlueprint extends HitObjectSelectionBlueprint<Slider>
{
  #sliderHead!: SkinnableDrawable;
  #sliderTail!: SkinnableDrawable;

  public readonly scaleBindable = new Bindable(1);
  public readonly positionBindable = new Bindable(new Vec2());
  public readonly stackHeightBindable = new Bindable(0);
  public readonly pathVersion = new Bindable(0);

  protected override onApply(entry: HitObjectLifetimeEntry)
  {
    super.onApply(entry);

    this.scaleBindable.bindTo(this.hitObject.scaleBindable);
    this.positionBindable.bindTo(this.hitObject.positionBindable);
    this.stackHeightBindable.bindTo(this.hitObject.stackHeightBindable);
    this.pathVersion.bindTo(this.hitObject.path.version);

    this.hitObject.defaultsApplied.addListener(this.#defaultsApplied, this);

    this.#updateTail();
  }

  protected override onFree(entry: HitObjectLifetimeEntry)
  {
    super.onFree(entry);

    this.scaleBindable.unbindFrom(this.hitObject.scaleBindable);
    this.positionBindable.unbindFrom(this.hitObject.positionBindable);
    this.stackHeightBindable.unbindFrom(this.hitObject.stackHeightBindable);
    this.pathVersion.unbindFrom(this.hitObject.path.version);

    this.hitObject.defaultsApplied.removeListener(this.#defaultsApplied, this);
  }

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
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.scaleBindable.bindValueChanged(e => this.#sliderHead.scale = this.#sliderTail.scale = e.value, true);
    this.positionBindable.bindValueChanged(e =>
    {
      this.position = this.hitObject.stackedPosition;
      // this.updateDrawNodeTransform();
    }, true);
    this.stackHeightBindable.bindValueChanged(e => this.position = this.hitObject.stackedPosition);
    this.pathVersion.bindValueChanged(() => this.scheduler.addOnce(this.#updateTail, this));

    this.#updateTail();
  }

  #defaultsApplied()
  {
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

  public override drawableBecameAlive(drawableHitObject: DrawableHitObject)
  {
    if (drawableHitObject instanceof DrawableSlider)
    {
      this.#drawableSlider = drawableHitObject;

      drawableHitObject.proxyLayer.add(this.#proxy = new ProxyDrawable(this));
    }

    this.#updateSelection();
  }

  public override drawableBecameDead(drawableHitObject: DrawableHitObject)
  {
    this.#drawableSlider = undefined;

    if (this.#proxy && drawableHitObject instanceof DrawableSlider)
    {
      drawableHitObject.proxyLayer.remove(this.#proxy);
      this.#proxy = null;
    }
  }

  protected override containsLocal(position: Vec2): boolean
  {
    return this.hitObject.contains(position.add(this.position));
  }

  @resolved(ComposeToolContainer)
  accessor #toolContainer!: ComposeToolContainer


  protected override onDragStart(e: DragStartEvent): boolean
  {
    if (!this.selected)
      this.selectExclusive();

    this.#toolContainer.push(new MoveTool({ completeOnMouseUp: true }));

    return false;
  }

  public override isInSelectionRect(rectangle: Rectangle): boolean
  {
    return rectangle.contains(this.hitObject.stackedPosition)
        || rectangle.contains(this.hitObject.stackedPathEndPosition);
  }

  #proxy: ProxyDrawable | null = null;
}
