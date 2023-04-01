import {Container} from "pixi.js";
import {EditorInstance} from "@/editor/createEditor";

export class ToolContext {
  constructor(
    public editor: EditorInstance,
    public canvas: HTMLCanvasElement,
    public viewportContainer: Container,
    public overlay: Container
  ) {}
}
