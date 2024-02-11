import {ShallowRef} from "vue";
import {ComposeTool} from "./ComposeTool.ts";
import {SelectTool} from "./SelectTool.ts";
import {NoArgsConstructor, Vec2} from "@osucad/common";

interface ToolInfo {
  tool: NoArgsConstructor<ComposeTool>;
  name: string;
  icon: string;
}

export class ToolManager {

  constructor(tool: ComposeTool = new SelectTool()) {
    this.activeTool = tool;
  }

  private _activeTool = shallowRef() as ShallowRef<ComposeTool>;

  get activeTool() {
    return this._activeTool.value;
  }

  set activeTool(tool: ComposeTool) {
    const mousePos = this._activeTool.value?.mousePos ?? new Vec2();
    this._activeTool.value?.destroy();

    this._activeTool.value = tool;
    tool.mousePos = mousePos;
  }
}