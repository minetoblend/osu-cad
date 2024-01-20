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

export class Toolbar extends Component {
  @Inject(VIEWPORT_SIZE)
  private readonly canvasSize!: ISize;

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
    this.addChild(this.background, ...this.buttons);
  }

  onLoad() {
    watchEffect(() => this.updateBounds());
    useEventListener("keydown", (evt) => {
      if (this.toolContainer.tool.acceptsNumberKeys) return;
      if(evt.ctrlKey || evt.metaKey || evt.altKey || evt.shiftKey) return;
      switch (evt.key) {
        case "1":
          this.toolContainer.tool = new SelectTool();
          break;
        case "2":
          this.toolContainer.tool = new HitCircleTool();
          break;
        case "3":
          this.toolContainer.tool = new SliderTool();
          break;
        case "4":
          this.toolContainer.tool = new SpinnerTool();
          break;
      }
    });
  }


  updateBounds() {
    const timelineScale = Math.max(Math.min(this.canvasSize.height / 720, this.canvasSize.width / 1280), 0.5);
    const bounds = new Rect(0, 0, 48, this.canvasSize.height - 75 * timelineScale);
    this.setBounds(bounds);

    for (const button of this.buttons) {
      button.setBounds(bounds.splitTop(48));
    }
  }

  _onUpdate(point?: ObservablePoint) {
    super._onUpdate(point);
    this.background.scale.copyFrom(this.size);
  }

}