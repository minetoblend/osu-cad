import {ReceivePlayfieldMouseEvents, Tool} from "@/tools/tool";
import {ResourceProvider} from "@/draw";
import {EditorContext} from "@/objects/Editor";
import {ToolManager} from "@/components/screen/compose/tool.manager";
import {OsuCadMouseEvent} from "@/components/screen/compose/playfield";

export class SelectTool extends Tool implements ReceivePlayfieldMouseEvents {
  constructor(readonly context: EditorContext, resourceProvider: ResourceProvider,  readonly toolManager: ToolManager) {
    super('select', 'Select', resourceProvider);
  }

  onPlayfieldMouseDown(evt: OsuCadMouseEvent): void {
    if (evt.button === 2) {
      if (evt.hitObject) this.context.connector.removeHitObject(evt.hitObject)
      return
    }
    if (evt.button === 0) {
      if (evt.hitObject) {
        if (!evt.hitObject.isSelected) {
          this.context.selectionManager.selectOnly(evt.hitObject)
        }
      }
    }
  }
}