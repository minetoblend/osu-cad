import type { DrawableHitObject } from "@osucad/core";
import { SkinnableDrawable } from "@osucad/core";
import { HitObjectComposer } from "@osucad/editor";
import type { DragStartEvent, Rectangle } from "@osucad/framework";
import { ProxyDrawable } from "@osucad/framework";
import { Anchor, Axes, Bindable, Container, dependencyLoader, resolved, Vec2 } from "@osucad/framework";
import { Color } from "pixi.js";
import type { Slider } from "../../../hitObjects";
import { DrawableSlider } from "../../../hitObjects/drawables/DrawableSlider";
import { OsuSkinComponents } from "../../../skinning";
import { MoveInteraction } from "../../interactions/MoveInteraction";
import { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";
import { DrawableHitCircle } from "../../../hitObjects/drawables/DrawableHitCircle";

export class SliderSelectionBlueprint extends HitObjectSelectionBlueprint<Slider>
{
  #content!: Container;
  #sliderHead!: SkinnableDrawable;
  #sliderTail!: SkinnableDrawable;

  public readonly scaleBindable = new Bindable(1);
  public readonly positionBindable = new Bindable(new Vec2());
  public readonly stackHeightBindable = new Bindable(0);
  public readonly pathVersion = new Bindable(0);

  @dependencyLoader()
  #load()
  {
    this.addInternal(this.#content = new Container({
      relativeSizeAxes: Axes.Both,
      children: [
        this.#sliderTail = new SkinnableDrawable(OsuSkinComponents.HitCircleSelect).with({
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
        this.#sliderHead = new SkinnableDrawable(OsuSkinComponents.HitCircleSelect).with({
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
      ],
    }));

    this.scaleBindable.bindTo(this.hitObject.scaleBindable);
    this.positionBindable.bindTo(this.hitObject.positionBindable);
    this.stackHeightBindable.bindTo(this.hitObject.stackHeightBindable);
    this.pathVersion.bindTo(this.hitObject.path.version);
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

    this.hitObject.defaultsApplied.addListener(this.#defaultsApplied, this);
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

  @resolved(HitObjectComposer)
    accessor #composer!: HitObjectComposer


  protected override onDragStart(e: DragStartEvent): boolean
  {
    if (!this.selected)
      this.selectExclusive();

    this.#composer.beginInteraction(new MoveInteraction({ completeOnMouseUp: true }));

    return false;
  }

  public override isInSelectionRect(rectangle: Rectangle): boolean
  {
    return rectangle.contains(this.hitObject.stackedPosition)
      || rectangle.contains(this.hitObject.stackedPathEndPosition);
  }

  #proxy: ProxyDrawable | null = null;

  public override dispose()
  {
    this.hitObject.defaultsApplied.removeListener(this.#defaultsApplied, this);

    super.dispose();
  }
}
