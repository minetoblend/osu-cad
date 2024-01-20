import {ToolInteraction} from "./ToolInteraction.ts";


export class UndoableInteraction extends ToolInteraction {

  onComplete() {
    this.commandManager.commit();
  }

  onCancel() {
    if (this.commandManager.commit())
      this.commandManager.undo();
  }

}