import { Bindable } from "@osucad/framework";
import type { DocumentRuntime } from "@osucad/multiplayer-core";
import { DocumentHistory } from "@osucad/multiplayer-core";

export class EditorHistory extends DocumentHistory
{
  public readonly canUndoBindable = new Bindable(false);
  public readonly canRedoBindable = new Bindable(false);

  public constructor(runtime: DocumentRuntime)
  {
    super(runtime);

    this.on("undo", this.#updateBindables, this);
    this.on("redo", this.#updateBindables, this);
    this.on("commit", this.#updateBindables, this);
  }

  #updateBindables()
  {
    this.canUndoBindable.value = this.canUndo;
    this.canRedoBindable.value = this.canRedo;
  }
}
