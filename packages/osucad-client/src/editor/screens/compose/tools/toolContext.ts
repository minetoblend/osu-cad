import { CommandManager } from '@/editor/commands/commandManager';
import { Container } from "pixi.js";
import { EditorInstance } from "@/editor/createEditor";
import { Ref } from "vue";
import { Vec2 } from "@osucad/common";
import { ToolManager } from './toolManager';

export class ToolContext {
  constructor(
    public toolManager: ToolManager,
    public editor: EditorInstance,
    public canvas: HTMLCanvasElement,
    public mousePos: Readonly<Ref<Vec2>>,
    public overlay: Container,
  ) {}

}
