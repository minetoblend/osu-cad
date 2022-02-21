import {Ref, shallowRef, watch} from "vue";
import {ReceivePlayfieldMouseEvents, Tool} from "@/tools/tool";
import {EditorContext} from "@/objects/Editor";
import {Playfield} from "@/components/screen/compose/playfield";

export class ToolManager {
  tools: Tool[];
  tool: Ref<Tool>;

  constructor(
    readonly context: EditorContext,
    readonly playfield: Playfield,
    ...tools: any[]) {

    this.tools = tools.map(t => new t(context, context.resourceProvider, this))

    this.tool = shallowRef<Tool>(tools[0])
    this.onToolSelected(this.tool.value, null)

    watch(this.tool, (tool, oldTool) => this.onToolSelected(tool, oldTool))

    this.setupListeners()
  }

  private onToolSelected(tool: Tool, oldTool: Tool | null) {
    if (oldTool) {
      if (oldTool.onToolDeselect)
        oldTool.onToolDeselect({
          playfield: this.playfield
        })
    }
    if (tool.onToolSelect) {
      tool.onToolSelect({
        playfield: this.playfield
      })
    }
  }

  private setupListeners() {
    this.playfield.onMouseMove.subscribe(evt => {
      const tool = this.tool.value as ReceivePlayfieldMouseEvents
      if (tool.onPlayfieldMouseMove)
        tool.onPlayfieldMouseMove(evt)
    })
    this.playfield.onMouseDown.subscribe(evt => {
      const tool = this.tool.value as ReceivePlayfieldMouseEvents
      if (tool.onPlayfieldMouseDown)
        tool.onPlayfieldMouseDown(evt)
    })
  }

  selectTool(id: string) {
    const tool = this.tools.find(tool => tool.id === id)
    if (tool)
      this.tool.value = tool
  }
}