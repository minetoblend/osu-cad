import type { DrawableHitObject } from "@osucad/core";
import { SkinnableDrawable } from "@osucad/core";
import { HitObjectComposer } from "@osucad/editor";
import type { ClickEvent, DragStartEvent, MouseDownEvent, Rectangle } from "@osucad/framework";
import { Anchor, Bindable, dependencyLoader, ProxyDrawable, resolved, Vec2 } from "@osucad/framework";
import type { HitCircle } from "../../../hitObjects";
import { OsuHitObject } from "../../../hitObjects";
import { DrawableHitCircle } from "../../../hitObjects/drawables/DrawableHitCircle";
import { OsuSkinComponents } from "../../../skinning";
import { MoveInteraction } from "../../interactions/MoveInteraction";
import { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";
import { SelectTool } from "./SelectTool";

export class HitCircleSelectionBlueprint extends HitObjectSelectionBlueprint<HitCircle>
{
  public readonly scaleBindable = new Bindable(1);
  public readonly positionBindable = new Bindable(new Vec2());
  public readonly stackHeightBindable = new Bindable(0);

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
      new SkinnableDrawable(OsuSkinComponents.HitCircleSelect).with({
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

  #dragStartPosition!: Vec2;

  @resolved(() => SelectTool)
  accessor #selectTool!: SelectTool

  @resolved(HitObjectComposer)
  accessor #composer!: HitObjectComposer

  protected override onDragStart(e: DragStartEvent): boolean
  {
    if (!this.selected)
      this.selectExclusive();

    this.#composer.beginInteraction(new MoveInteraction({ completeOnMouseUp: true }));

    return true;
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

  public override onClick(e: ClickEvent): boolean
  {
    if (this.#canCycleSelection)
    {
      this.#selectTool.cycleSelection(this);
      this.#canCycleSelection = false;
      return true;
    }
    return false;
  }

  public override drawableBecameAlive(drawableHitObject: DrawableHitObject)
  {
    if (drawableHitObject instanceof DrawableHitCircle)
    {
      this.#drawableHitObject = drawableHitObject;
      drawableHitObject.proxyLayer.add(this.#proxy = new ProxyDrawable(this));
    }
  }

  public override drawableBecameDead(drawableHitObject: DrawableHitObject)
  {
    if (this.#proxy && drawableHitObject instanceof DrawableHitCircle)
    {
      this.#drawableHitObject = null;
      drawableHitObject.proxyLayer.remove(this.#proxy);
      this.#proxy = null;
    }
  }

  public override isInSelectionRect(rectangle: Rectangle): boolean
  {
    return rectangle.contains(this.hitObject.stackedPosition);
  }

  public override dispose()
  {
    if (this.#proxy)
      this.#drawableHitObject?.proxyLayer.remove(this.#proxy);

    super.dispose();
  }
}
