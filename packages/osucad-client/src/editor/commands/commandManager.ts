import { onKeyDown, onKeyStroke, useEventListener } from "@vueuse/core";
import { EditorInstance } from "@/editor/createEditor";
import { Command } from "./command";
import { EffectScope, Ref, effectScope, shallowRef, watch } from "vue";
import { Container } from "pixi.js";
import { Vec2 } from "@osucad/common";
import { MoveHitObjectCommand } from "./moveHitObject";

export type CommandClass = new (
  editor: EditorInstance,
  mousePos: Readonly<Ref<Vec2>>
) => Command;

export class CommandManager {
  scope?: EffectScope;
  currentCommand = shallowRef<Command>();

  overlayContainer = new Container();

  constructor(
    private readonly editor: EditorInstance,
    private readonly canvas: HTMLCanvasElement,
    private readonly mousePos: Readonly<Ref<Vec2>>
  ) {
    onKeyDown("Escape", () => {
      if (this.currentCommand.value) this.finishCurrentOperation();
    });
  }

  startOperation<T extends CommandClass>(
    operation: T,
    onCreate?: (command: InstanceType<T>, overlay: Container) => void
  ): InstanceType<T> | undefined {
    this.finishCurrentOperation();

    const command = new operation(this.editor, this.mousePos);
    if (command.setup?.() === false) return;

    if (command.interactive) {
      const overlay = new Container();
      this.overlayContainer.addChild(overlay);
      this.scope = effectScope();
      this.currentCommand.value = command;
      this.scope.run(() => {
        onCreate?.(command as InstanceType<T>, overlay);

        watch(
          () => command.propValues(),
          () => command.apply(),
          { immediate: true }
        );
      });

      return command as InstanceType<T>;
    } else {
      command.apply();
      command.cleanup?.();
    }
  }

  finishCurrentOperation() {
    this.scope?.stop();
    this.currentCommand.value?.cleanup();
    this.currentCommand.value = undefined;
    this.overlayContainer.removeChildren();
  }
}
