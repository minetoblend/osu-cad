import { MoveHitObjectInteraction } from "@/editor/interactions/moveHitObjects";
import {
  Interaction,
  InteractionInstance,
} from "@/editor/interactions/defineInteraction";
import { onKeyStroke } from "@vueuse/core";
import { Ref, ShallowRef, shallowRef } from "vue";
import { CircleTool } from "./circleTool";
import { SelectTool } from "./selectTool";
import { EditorInstance } from "@/editor/createEditor";
import { Container } from "pixi.js";
import { IComposeTool, IComposeToolInstance } from "./defineTool";
import { ToolContext } from "./toolContext";
import { Vec2 } from "@osucad/common";
import { CommandManager } from "@/editor/commands/commandManager";
import { ScaleHitObjectsInteraction } from "@/editor/interactions/scaleHitObjectsInteraction";

export class ToolManager {
  readonly overlay = new Container();

  readonly tools: IComposeTool[] = [SelectTool, CircleTool];

  #activeToolInstance: ShallowRef<IComposeToolInstance | undefined>;
  #activeTool: ShallowRef<IComposeTool>;

  #activeInteraction = shallowRef<InteractionInstance>();

  get activeTool() {
    return this.#activeTool.value;
  }

  constructor(
    private editor: EditorInstance,
    private canvas: HTMLCanvasElement,
    private mousePos: Readonly<Ref<Vec2>>,
    private commandManager: CommandManager
  ) {
    this.#activeTool = shallowRef() as ShallowRef<IComposeTool>;
    this.#activeToolInstance = shallowRef() as ShallowRef<IComposeToolInstance>;

    this.selectTool(this.tools[0]);

    onKeyStroke("1", () => {
      if (!this.#activeInteraction.value) this.selectTool(this.tools[0]);
    });
    onKeyStroke("2", () => {
      if (!this.#activeInteraction.value) this.selectTool(this.tools[1]);
    });

    onKeyStroke("g", () => {
      if (!this.#activeInteraction.value)
        this.beginInteraction(MoveHitObjectInteraction);
    });

    onKeyStroke("s", () => {
      if (!this.#activeInteraction.value)
        this.beginInteraction(ScaleHitObjectsInteraction);
    });
  }

  #createToolContext() {
    return new ToolContext(
      this,
      this.editor,
      this.canvas,
      this.mousePos,
      this.overlay
    );
  }

  selectTool(tool: IComposeTool) {
    if (
      tool !== this.#activeTool.value &&
      this.commandManager.currentCommand.value
    ) {
      this.commandManager.finishCurrentOperation();
    }
    this.#activeToolInstance.value?.destroy();
    this.#activeTool.value = tool;
    this.#activeToolInstance.value = tool.setup(this.#createToolContext());
  }

  beginInteraction(interaction: Interaction) {
    const instance = this.commandManager.startOperation(
      interaction.command,
      (command) => {
        const instance = interaction.setup(this.#createToolContext(), command);
        // this.#activeToolInstance.value?.destroy();
        // this.#activeToolInstance.value = undefined;
        this.#activeInteraction.value = instance;
      }
    );
  }

  finishInteraction(instance: InteractionInstance) {
    if (this.#activeInteraction.value !== instance) return;

    this.#activeInteraction.value?.destroy();
    this.#activeInteraction.value = undefined;
    if (!this.#activeToolInstance.value) {
      this.selectTool(this.#activeTool.value);
    }
  }
}
