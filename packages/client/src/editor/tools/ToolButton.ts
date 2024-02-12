import {Texture} from "pixi.js";
import {NoArgsConstructor} from "@osucad/common";
import {ComposeTool} from "./ComposeTool.ts";
import {Inject} from "../drawables/di";
import {EditorContext} from "@/editor/editorContext.ts";
import {ToolbarButton} from "@/editor/tools/ToolbarButton.ts";

export class ToolButton extends ToolbarButton {

  constructor(
    options: {
      icon: Texture,
      tool: NoArgsConstructor<ComposeTool>
    },
  ) {
    super({
      icon: options.icon,
      action: () => {
        this.editor.tools.activeTool = new options.tool();
      }
    });
    this.tool = options.tool;
  }

  @Inject(EditorContext)
  private readonly editor!: EditorContext;

  onLoad() {
    watchEffect(() => {
      this.active = this.tool === this.editor.tools.activeTool.constructor;
    });
    this.onpointerdown = () => {
      this.editor.tools.activeTool = new this.tool();
    };
  }

  public readonly tool: NoArgsConstructor<ComposeTool>;

}