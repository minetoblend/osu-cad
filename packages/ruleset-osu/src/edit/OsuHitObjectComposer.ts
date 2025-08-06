import { EditorIcons, HitObjectComposer } from "@osucad/editor";
import { SelectTool } from "./tools/select/SelectTool";

export class OsuHitObjectComposer extends HitObjectComposer
{
  constructor()
  {
    super();
  }

  protected override getTools()
  {
    return [
      {
        name: "Select",
        icon: EditorIcons.select,
        tool: SelectTool,
      },
    ];
  }
}
