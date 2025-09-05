import { type ComposeToolInfo, HitObjectComposer, HitObjectSelection } from "@osucad/editor";
import { asyncDependencyLoader, provide, resolved } from "@osucad/framework";
import type { OsuHitObject } from "../hitObjects";
import { PlayfieldGrid } from "./PlayfieldGrid";
import { HitCircleTool } from "./tools/circle/HitCircleTool";
import { SelectTool } from "./tools/select/SelectTool";
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
      HitCircleTool,
      SliderTool,
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
      if (!(tool.value instanceof SelectTool))
        this.#selection.clear();
    });
  }
}
