import {Component} from "../drawables/Component.ts";
import {Box} from "../drawables/Box.ts";
import {Assets, ObservablePoint} from "pixi.js";
import {Inject} from "../drawables/di";
import {VIEWPORT_SIZE} from "../drawables/injectionKeys.ts";
import {ISize, Rect} from "@osucad/common";
import {ToolButton} from "./ToolButton.ts";
import {SelectTool} from "./SelectTool.ts";
import {HitCircleTool} from "./HitCircleTool.ts";
import {ToolContainer} from "./ToolContainer.ts";
import {SliderTool} from "./SliderTool.ts";
import {SpinnerTool} from "./SpinnerTool.ts";
import {isMobile} from "@/util/isMobile.ts";
import {EditorContext} from "@/editor/editorContext.ts";
import {ComposeTool} from "@/editor/tools/ComposeTool.ts";

export class Toolbar extends Component {
  @Inject(VIEWPORT_SIZE)
  private readonly canvasSize!: ISize;

  @Inject(EditorContext)
  private readonly editor!: EditorContext;


  private readonly background = new Box({
    tint: 0x1A1A20,
  });

  private buttons: ToolButton[] = [
    new ToolButton({
      icon: Assets.get("icon-select"),
      tool: SelectTool,
    }),
    new ToolButton({
      icon: Assets.get("icon-circle"),
      tool: HitCircleTool,
    }),
    new ToolButton({
      icon: Assets.get("icon-slider"),
      tool: SliderTool,
    }),
    new ToolButton({
      icon: Assets.get("icon-spinner"),
      tool: SpinnerTool,
    }),
  ];

  @Inject(ToolContainer)
  private readonly toolContainer!: ToolContainer;

  constructor() {
    super();
    if (isMobile())
      this.background.visible = false;

    this.addChild(this.background, ...this.buttons);
  }

  get tool() {
    return this.editor.tools.activeTool;
  }

  set tool(tool: ComposeTool) {
    this.editor.tools.activeTool = tool;

  }

  onLoad() {
    watchEffect(() => this.updateBounds());
    useEventListener("keydown", (evt) => {
      if (this.editor.tools.activeTool.acceptsNumberKeys) return;
      if (evt.ctrlKey || evt.metaKey || evt.altKey || evt.shiftKey) return;
      switch (evt.key) {
        case "1":
          this.tool = new SelectTool();
          break;
        case "2":
          this.tool = new HitCircleTool();
          break;
        case "3":
          this.tool = new SliderTool();
          break;
        case "4":
          this.tool = new SpinnerTool();
          break;
      }
    });
  }


  updateBounds() {
    if (this.size.x === 0 || this.size.y === 0) return;
    const bounds = new Rect(0, 0, this.size.x, this.size.y);
    for (const button of this.buttons) {
      button.setBounds(bounds.splitTop(48));
    }
  }

  _onUpdate(point?: ObservablePoint) {
    super._onUpdate(point);
    this.background.scale.copyFrom(this.size);
  }

}