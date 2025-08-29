import { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";
import type { OsuHitObject, Slider } from "../../../hitObjects";
import type { DragStartEvent, DragEvent, DragEndEvent } from "@osucad/framework";
import { Anchor, Bindable, dependencyLoader, resolved, Vec2 } from "@osucad/framework";
import { OsuSkinComponents } from "../../../skinning";
import type { DrawableHitObject } from "@osucad/core";
import { SkinnableDrawable } from "@osucad/core";
import { DrawableSlider } from "../../../hitObjects/drawables/DrawableSlider";
import { Color } from "pixi.js";
import { SelectTool } from "./SelectTool";

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

  @resolved(() => SelectTool)
  accessor #selectTool!: SelectTool

  #dragPositions!: Vec2[];
  #dragStartPosition!: Vec2;
  #draggedHitObjects!: OsuHitObject[];

  override onDragStart(e: DragStartEvent): boolean
  {
    if (!this.selected)
      this.selectExclusive();


    this.#dragStartPosition = this.parent!.toLocalSpace(e.screenSpaceMousePosition);
    this.#draggedHitObjects = [...this.selection] as OsuHitObject[];
    this.#dragPositions = this.#draggedHitObjects.map(it => it.position);

    return true;
  }

  override onDrag(e: DragEvent): boolean
  {
    const delta = this.parent!.toLocalSpace(e.screenSpaceMousePosition).sub(this.#dragStartPosition);


    this.#selectTool.moveObjects(delta, this.#draggedHitObjects, this.#dragPositions);

    return true;
  }

  override onDragEnd(e: DragEndEvent): void
  {
    this.history.commit();
  }

  override dispose()
  {
    this.hitObject.defaultsApplied.removeListener(this.#updateTail, this);
    super.dispose();
  }
}
