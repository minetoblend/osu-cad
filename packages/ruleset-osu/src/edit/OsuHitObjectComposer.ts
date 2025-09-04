import { type ComposeToolInfo, HitObjectComposer, HitObjectSelection } from "@osucad/editor";
import { asyncDependencyLoader, loadTexture, provide, resolved } from "@osucad/framework";
import type { OsuHitObject } from "../hitObjects";
import { PlayfieldGrid } from "./PlayfieldGrid";
import { HitCircleTool } from "./tools/circle/HitCircleTool";
import { HitCircleToolPresenceOverlay } from "./tools/circle/HitCircleToolPresence";
import { SelectTool } from "./tools/select/SelectTool";
import { SelectToolPresenceOverlay } from "./tools/select/SelectToolPresenceOverlay";
import { SliderToolPresenceOverlay } from "./tools/slider/HitCircleToolPresence";
import { SliderTool } from "./tools/slider/SliderTool";
import { SnapManager } from "./SnapManager";

export class OsuHitObjectComposer extends HitObjectComposer
{
  @provide()
  public readonly snapManager = new SnapManager();

  public constructor()
  {
    super();
  }

  public async getTools(): Promise<ComposeToolInfo[]>
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
    this.addInternal(this.snapManager);

    this.rulesetContainer.add(this.drawableRuleset.createPlayfieldAdjustmentContainer().with({
      depth: 1,
      child: new PlayfieldGrid(),
    }));
  }

  @resolved(HitObjectSelection)
  accessor #selection!: HitObjectSelection<OsuHitObject>;

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.activeTool.bindValueChanged(tool =>
    {
      if (tool.value.id !== "select")
        this.#selection.clear();
    });
  }
}
