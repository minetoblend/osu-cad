import { effectScope } from "vue";
import { ToolContext } from "@/editor/screens/compose/tools/toolContext";
import { CommandClass } from "@/editor/commands/commandManager";
import { withToolContext } from "@/editor/screens/compose/tools/defineTool";
import { Command } from "../commands/command";

export function defineInteraction<T extends CommandClass>(
  command: T,
  setupFn: (command: InstanceType<T>, finish: () => void) => void
): Interaction<T> {
  return {
    command,
    setup: (ctx: ToolContext, command: InstanceType<T>) =>
      withToolContext(ctx, () => {
        const scope = effectScope();

        const instance: InteractionInstance = {
          command,
          destroy: () => scope.stop(),
        };

        const finish = () => {
          ctx.toolManager.finishInteraction(instance);
        };

        scope.run(() => {
          setupFn(command, finish);
        });

        return instance;
      }),
  };
}

export interface InteractionInstance {
  command: Command;
  destroy: () => void;
}

export type Interaction<T extends CommandClass = CommandClass> = {
  command: T;
  setup: (ctx: ToolContext, command: InstanceType<T>) => InteractionInstance;
};
