import {SelectTool} from "./selectTool";
import {EditorInstance} from "@/editor/createEditor";
import {Container} from "pixi.js";
import {IComposeTool, IComposeToolInstance} from "./defineTool";
import {ToolContext} from "./toolContext";

export class ToolManager {
  readonly overlay = new Container();

  readonly tools: IComposeTool[] = [SelectTool];

  activeTool: IComposeToolInstance;

  constructor(
    private editor: EditorInstance,
    private canvas: HTMLCanvasElement,
    private viewportContainer: Container
  ) {
    viewportContainer.addChild(this.overlay);

    this.activeTool = SelectTool.setup(
      new ToolContext(
        this.editor,
        this.canvas,
        this.viewportContainer,
        this.overlay
      )
    );
  }
}
