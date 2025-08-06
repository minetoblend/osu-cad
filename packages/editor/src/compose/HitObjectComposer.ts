import { Ruleset } from "@osucad/core";
import { Axes, CompositeDrawable, dependencyLoader, provide, resolved } from "@osucad/framework";
import { EditorBeatmap } from "../EditorBeatmap";
import type { ComposeToolInfo } from "./tools";
import { ComposeToolbar } from "./tools";
import { ActiveToolBindable } from "./tools/ActiveToolBindable";
import { ComposeToolContainer } from "./tools/ComposeToolContainer";

export abstract class HitObjectComposer extends CompositeDrawable
{
  protected constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  #toolbar!: ComposeToolbar;

  @provide()
  readonly activeTool = new ActiveToolBindable(null!);

  @resolved(Ruleset)
  accessor ruleset!: Ruleset;

  @resolved(EditorBeatmap)
  accessor beatmap!: EditorBeatmap;

  @dependencyLoader()
  #load()
  {
    this.internalChildren = [
      new ComposeToolContainer(),
      this.#toolbar = new ComposeToolbar(),
    ];

    const tools = this.getTools();
    this.activeTool.value = tools[0];

    for (const tool of tools)
      this.#toolbar.addTool(tool);
  }

  protected override loadComplete()
  {
    super.loadComplete();
  }

  protected abstract getTools(): ComposeToolInfo[];
}
