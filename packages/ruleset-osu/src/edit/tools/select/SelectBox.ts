import type { DragEndEvent, DragEvent, DragStartEvent } from "@osucad/framework";
import { GraphicsDrawable, Rectangle, resolved, Vec2 } from "@osucad/framework";
import type { Graphics } from "pixi.js";
import type { OsuHitObject } from "src/hitObjects";
import { HitObjectSelection } from "./HitObjectSelection";
import { Playfield } from "@osucad/core";
import { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";

export class SelectBox extends GraphicsDrawable
{
  #dragOrigin = Vec2.zero();
  #dragPosition = Vec2.zero();

  constructor()
  {
    super();
  }

  @resolved(HitObjectSelection as typeof HitObjectSelection<OsuHitObject>)
  accessor #selection!: HitObjectSelection<OsuHitObject>

  @resolved(SelectionBlueprintContainer as typeof SelectionBlueprintContainer<OsuHitObject>)
  accessor #selectionContainer!: SelectionBlueprintContainer<OsuHitObject>;

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean
  {
    return true;
  }

  override onDragStart(e: DragStartEvent): boolean
  {
    this.#dragOrigin = e.mousePosition;
    this.#selection.clear();
    return true;
  }

  override onDrag(e: DragEvent): boolean
  {
    this.#dragPosition = e.mousePosition;
    this.invalidateGraphics();

    const origin = this.toSpaceOfOtherDrawable(this.#dragOrigin, this.#selectionContainer);
    const position = this.toSpaceOfOtherDrawable(this.#dragPosition, this.#selectionContainer);

    const min = origin.componentMin(position);
    const max =  origin.componentMax(position);
    const rect = new Rectangle(min.x, min.y, max.x - min.x, max.y - min.y);

    const hitObjects = this.#selectionContainer.allBlueprints.filter(it => it.isInSelectionRect(rect)).map(it => it.hitObject);

    this.#selection.clear();
    this.#selection.addRange(hitObjects);

    return true;
  }

  override onDragEnd(e: DragEndEvent): void
  {
    this.invalidateGraphics();
  }

  protected override updateGraphics(g: Graphics): void
  {
    g.clear();
    if (!this.isDragged)
      return;

    const min = this.#dragOrigin.componentMin(this.#dragPosition);
    const max = this.#dragOrigin.componentMax(this.#dragPosition);

    g.rect(min.x, min.y, max.x - min.x, max.y - min.y).stroke({ color: 0xffffff });
  }
}
