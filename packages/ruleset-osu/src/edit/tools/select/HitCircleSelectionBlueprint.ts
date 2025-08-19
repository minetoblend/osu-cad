import type { ClickEvent, DragEndEvent, DragEvent, DragStartEvent, Drawable, MouseDownEvent, Rectangle } from "@osucad/framework";
import { Anchor, Bindable, dependencyLoader, ProxyDrawable, resolved, Vec2 } from "@osucad/framework";
import type { HitCircle } from "../../../hitObjects";
import { OsuHitObject } from "../../../hitObjects";
import { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";
import type { DrawableHitObject } from "@osucad/core";
import { SkinnableDrawable } from "@osucad/core";
import { OsuSkinComponents } from "../../../skinning";
import { DrawableHitCircle } from "../../../hitObjects/drawables/DrawableHitCircle";
import { SelectTool } from "./SelectTool";

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

  #dragPositions!: Vec2[];
  #dragStartPosition!: Vec2;
  #draggedHitObjects!: OsuHitObject[];

  @resolved(() => SelectTool)
  accessor #selectTool!: SelectTool

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

  #canCycleSelection = false;

  protected override performMouseDownSelectionActions(e: MouseDownEvent)
  {
    if (e.controlPressed)
    {
      this.selection.toggle(this.hitObject);
      return;
    }

    if (!this.selected)
      this.selectExclusive();
    else if (this.selection.size === 1)
      this.#canCycleSelection = true;
  }

  override onClick(e: ClickEvent): boolean
  {
    if (this.#canCycleSelection)
    {
      this.#selectTool.cycleSelection(this);
      this.#canCycleSelection = false;
      return true;
    }
    return false;
  }

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

  override isInSelectionRect(rectangle: Rectangle): boolean
  {
    return rectangle.contains(this.hitObject.stackedPosition);
  }

  override dispose()
  {
    if (this.#proxy)
      this.#drawableHitObject?.proxyLayer.remove(this.#proxy);

    super.dispose();
  }
}
