import { type ComposeToolInfo, HitObjectComposer } from "@osucad/editor";
import { SelectTool } from "./tools/select/SelectTool";
import { asyncDependencyLoader, loadTexture } from "@osucad/framework";
import { PlayfieldGrid } from "./PlayfieldGrid";
import { HitCircleTool } from "./tools/circle/HitCircleTool";

export class OsuHitObjectComposer extends HitObjectComposer
{
  constructor()
  {
    super();
  }

  async getTools(): Promise<ComposeToolInfo[]>
  {
    return [
      {
        name: "Select",
        tool: SelectTool,
        icon: await loadTexture(new URL("./tools/select/select.png", import.meta.url).href),
      },
      {
        name: "Hitcircle",
        tool: HitCircleTool,
        icon: await loadTexture(new URL("./tools/circle/circle.png", import.meta.url).href),
      },
    ];
  }

  @asyncDependencyLoader()
  async #load()
  {
    this.rulesetContainer.add(this.drawableRuleset.createPlayfieldAdjustmentContainer().with({
      depth: 1,
      child: new PlayfieldGrid(),
    }));
  }
}
