import { type ComposeToolInfo, HitObjectComposer } from "@osucad/editor";
import { SelectTool } from "./tools/select/SelectTool";
import { asyncDependencyLoader, loadTexture } from "@osucad/framework";
import { PlayfieldGrid } from "./PlayfieldGrid";
import { HitCircleTool } from "./tools/circle/HitCircleTool";
import { HitCircleToolPresenceOverlay } from "./tools/circle/HitCircleToolPresence";
import { SelectToolPresenceOverlay } from "./tools/select/SelectToolPresenceOverlay";
import { SliderTool } from "./tools/slider/SliderTool";
import { SliderToolPresenceOverlay } from "./tools/slider/HitCircleToolPresence";

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
        id: "select",
        name: "Select",
        tool: SelectTool,
        icon: await loadTexture(new URL("./tools/select/select.png", import.meta.url).href),
        presenceOverlay: SelectToolPresenceOverlay,
      },
      {
        id: "circle",
        name: "Hitcircle",
        tool: HitCircleTool,
        icon: await loadTexture(new URL("./tools/circle/circle.png", import.meta.url).href),
        presenceOverlay: HitCircleToolPresenceOverlay,
      },
      {
        id: "slider",
        name: "Slider",
        tool: SliderTool,
        icon: await loadTexture(new URL("./tools/slider/slider.png", import.meta.url).href),
        presenceOverlay: SliderToolPresenceOverlay,
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
