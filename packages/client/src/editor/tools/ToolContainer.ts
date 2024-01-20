import {ComposeTool} from "./ComposeTool.ts";
import {ShallowRef} from "vue";
import {deleteObjectsInteraction} from "../interaction/deleteObjects.ts";
import {Drawable} from "../drawables/Drawable.ts";
import {Inject} from "../drawables/di";
import {EditorInstance} from "../editorClient.ts";
import {Vec2} from "@osucad/common";
import {copyPasteInteractions} from "../interaction/copyPasteInteractions.ts";
import {transformHitObjectsInteraction} from "../interaction/mirrorHitObjects.ts";
import {reverseHitObjectsInteraction} from "../interaction/reverseHitObjects.ts";
import {bookmarkInteractions} from "../interaction/bookmarks.ts";

export class ToolContainer extends Drawable {
  constructor(tool: ComposeTool) {
    super();
    this.tool = tool;
  }

  @Inject(EditorInstance)
  editor!: EditorInstance;

  onLoad() {
    deleteObjectsInteraction(this.editor);
    copyPasteInteractions(this.editor);
    transformHitObjectsInteraction(this.editor);
    reverseHitObjectsInteraction(this.editor);
    bookmarkInteractions(this.editor);
  }

  private _tool = shallowRef() as ShallowRef<ComposeTool>;

  set tool(tool: ComposeTool) {
    const mousePos = this._tool.value?.mousePos ?? new Vec2();
    this._tool.value?.destroy();

    this.removeChildren();
    this._tool.value = tool;
    tool.mousePos = mousePos;
    this.addChild(tool);
  }

  get tool() {
    return this._tool.value;
  }

}