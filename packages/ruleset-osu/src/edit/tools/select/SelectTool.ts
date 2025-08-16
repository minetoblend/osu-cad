import { ComposeTool } from "@osucad/editor";
import type { InputManager, KeyDownEvent } from "@osucad/framework";
import { dependencyLoader, Key } from "@osucad/framework";
import { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";

export class SelectTool extends ComposeTool
{
  selection!: SelectionBlueprintContainer;

  #inputManager!: InputManager;

  @dependencyLoader()
  #load()
  {
    this.addInternal(this.drawableRuleset.createPlayfieldAdjustmentContainer().with({
      child: this.selection = new SelectionBlueprintContainer(),
    }));
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;
  }

  override onKeyDown(e: KeyDownEvent): boolean
  {
    if (e.key === Key.Delete)
    {
      for (const obj of [...this.selection.selectedObjects])
      {
        obj.selected = false;
        this.beatmap.hitObjects.remove(obj.hitObject);
      }

      return true;
    }

    return false;
  }

  override getPresence()
  {
    const mousePosition = this.playfield.toLocalSpace(this.#inputManager.currentState.mouse.position);

    return {
      mousePosition: {
        x: Math.round(mousePosition.x),
        y: Math.round(mousePosition.y),
      },
    };
  }
}
