import type { DrawableHitObject } from "@osucad/core";
import { SkinnableDrawable } from "@osucad/core";
import { HitObjectComposer } from "@osucad/editor";
import type { DragEvent, DragStartEvent, Rectangle } from "@osucad/framework";
import { Anchor, Bindable, dependencyLoader, resolved, Vec2 } from "@osucad/framework";
import { Color } from "pixi.js";
import type { OsuHitObject, Slider } from "../../../hitObjects";
import { DrawableSlider } from "../../../hitObjects/drawables/DrawableSlider";
import { OsuSkinComponents } from "../../../skinning";
import { MoveOperator } from "../../operators/MoveOperator";
import { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";

export class SliderSelectionBlueprint extends HitObjectSelectionBlueprint<Slider>
{
  #sliderHead!: SkinnableDrawable;
  #sliderTail!: SkinnableDrawable;

  public readonly scaleBindable = new Bindable(1);
  public readonly positionBindable = new Bindable(new Vec2());
  public readonly stackHeightBindable = new Bindable(0);
  public readonly pathVersion = new Bindable(0);

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
    this.pathVersion.bindTo(this.hitObject.path.version);
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.scaleBindable.bindValueChanged(e => this.#sliderHead.scale = this.#sliderTail.scale = e.value, true);
    this.positionBindable.bindValueChanged(e =>
    {
      this.position = this.hitObject.stackedPosition;
      this.updateDrawNodeTransform();
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
      this.#drawableSlider = drawableHitObject;

    this.#updateSelection();
  }

  public override drawableBecameDead(drawableHitObject: DrawableHitObject)
  {
    this.#drawableSlider = undefined;
  }

  protected override containsLocal(position: Vec2): boolean
  {
    return this.hitObject.contains(position.add(this.position));
  }

  #dragStartPosition!: Vec2;

  @resolved(HitObjectComposer)
    accessor #composer!: HitObjectComposer

  #moveOperator?: MoveOperator;

  protected override onDragStart(e: DragStartEvent): boolean
  {
    if (!this.selected)
      this.selectExclusive();

    if (this.#moveOperator?.isDisposed !== false)
    {
      this.#moveOperator = this.#composer.beginOperator(MoveOperator, [...this.selection] as OsuHitObject[]);

      this.#dragStartPosition = this.parent!.toLocalSpace(e.screenSpaceMousePosition);
    }
    else
    {
      this.#dragStartPosition = this.parent!.toLocalSpace(e.screenSpaceMousePosition).sub(this.#moveOperator.movement);
    }

    return true;
  }

  protected override onDrag(e: DragEvent): boolean
  {
    if (this.#moveOperator)
    {
      this.#moveOperator.setMovement(this.parent!.toLocalSpace(e.screenSpaceMousePosition).sub(this.#dragStartPosition));
    }

    return true;
  }

  public override isInSelectionRect(rectangle: Rectangle): boolean
  {
    return rectangle.contains(this.hitObject.stackedPosition)
      || rectangle.contains(this.hitObject.stackedPathEndPosition);
  }

  public override dispose()
  {
    this.hitObject.defaultsApplied.removeListener(this.#defaultsApplied, this);

    super.dispose();
  }
}
