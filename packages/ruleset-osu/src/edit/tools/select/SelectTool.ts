import { ComposeTool } from "@osucad/editor";
import { dependencyLoader } from "@osucad/framework";
import { SelectionBlueprintContainer } from "./SelectionBlueprintContainer";

export class SelectTool extends ComposeTool
{
  @dependencyLoader()
  #load()
  {
    this.addInternal(this.drawableRuleset.createPlayfieldAdjustmentContainer().with({
      child: new SelectionBlueprintContainer(),
    }));
  }
}
