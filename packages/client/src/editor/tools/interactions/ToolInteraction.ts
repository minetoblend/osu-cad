import {ComposeTool} from "../ComposeTool.ts";
import {FederatedPointerEvent} from "pixi.js";
import {Drawable} from "../../drawables/Drawable.ts";
import {Inject} from "../../drawables/di";
import {EditorContext} from "@/editor/editorContext.ts";

export class ToolInteraction extends Drawable {

  constructor(protected readonly tool: ComposeTool) {
    super();
  }

  get acceptsNumberKeys() {
    return false;
  }

  @Inject(EditorContext)
  protected editor!: EditorContext;

  onMouseDown?(event: FederatedPointerEvent): void;

  onMouseUp?(event: FederatedPointerEvent): void;

  onMouseMove?(event: FederatedPointerEvent): void;

  onClick?(event: FederatedPointerEvent): void;

  onDrag?(event: FederatedPointerEvent): void;

  onDragStart?(event: FederatedPointerEvent): void;

  onDragEnd?(event: FederatedPointerEvent): void;

  onKeyDown?(event: KeyboardEvent, shortcut: string): boolean | void;

  onTick?(): void;

  onDestroy(): void {
    this.editor.commandManager.commit();
  }

  onComplete?(): void;

  onCancel?(): void;

  complete() {
    this.tool.completeInteraction();
  }

  cancel() {
    this.tool.cancelInteraction();
  }

  get mousePos() {
    return this.tool.mousePos;
  }

  get selection() {
    return this.tool.selection;
  }

  get commandManager() {
    return this.editor.commandManager;
  }

  get visibleHitObjects() {
    return this.tool.visibleHitObjects;
  }

  get altDown() {
    return this.tool.altDown;
  }

  get ctrlDown() {
    return this.tool.ctrlDown;
  }

  get shiftDown() {
    return this.tool.shiftDown;
  }

}