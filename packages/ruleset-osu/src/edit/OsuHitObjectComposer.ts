import { type ComposeToolInfo, HitObjectComposer, HitObjectSelection } from "@osucad/editor";
import { asyncDependencyLoader, provide, resolved } from "@osucad/framework";
import type { OsuHitObject } from "../hitObjects";
import { PlayfieldGrid } from "./PlayfieldGrid";
import { HitCircleTool } from "./tools/circle/HitCircleTool";
import { HitCircleToolPresenceOverlay } from "./tools/circle/HitCircleToolPresence";
import { SelectTool } from "./tools/select/SelectTool";
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

  public getTools(): ComposeToolInfo[]
  {
    return [
      SelectTool,
      {
        id: "circle",
        label: "Hitcircle",
        tool: HitCircleTool,
        icon: new URL("./tools/circle/circle.png", import.meta.url).href,
        presenceOverlay: HitCircleToolPresenceOverlay,
      },
      {
        id: "slider",
        label: "Slider",
        tool: SliderTool,
        icon: new URL("./tools/slider/slider.png", import.meta.url).href,
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
