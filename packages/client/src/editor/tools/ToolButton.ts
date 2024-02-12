import {IconButton} from "../drawables/IconButton.ts";
import {Texture} from "pixi.js";
import {NoArgsConstructor} from "@osucad/common";
import {ComposeTool} from "./ComposeTool.ts";
import {Inject} from "../drawables/di";
import {EditorContext} from "@/editor/editorContext.ts";

export class ToolButton extends IconButton {

  constructor(
    options: {
      icon: Texture,
      tool: NoArgsConstructor<ComposeTool>
    },
  ) {
    super({
      icon: options.icon,
      iconScale: 0.65,
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

  private _active = false;

  get active() {
    return this._active;
  }

  set active(value: boolean) {
    this._active = value;
    this.tint = value ? 0x52cca3 : 0xffffff;
  }


}