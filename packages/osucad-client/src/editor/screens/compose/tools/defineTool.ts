import { ToolContext } from "./toolContext";
import { effectScope } from "vue";

let currentContext: ToolContext | null = null;

export function defineTool(
  options: IToolOptions,
  setupFn: () => void
): IComposeTool {
  return {
    name: options.name,
    icon: options.icon,
    setup(ctx: ToolContext) {
      if (currentContext)
        throw new Error(
          "Tried to setup tool while setup of another tool was still active"
        );
      currentContext = ctx;

      const scope = effectScope();
      console.log("setup");

      scope.run(setupFn);
      currentContext = null;

      return {
        tool: this,
        destroy: () => {
          scope.stop();
        },
      };
    },
  };
}

export function withToolContext<T>(ctx: ToolContext, fn: () => T): T {
  if (currentContext)
    throw new Error(
      "Tried to setup tool while setup of another tool was still active"
    );
  currentContext = ctx;

  try {
    const result = fn();
    return result;
  } finally {
    currentContext = null;
  }
}

export function getToolContext() {
  if (!currentContext)
    throw new Error("Tried to get tool context outside of tool setup");
  return currentContext;
}

export interface IToolOptions {
  name: string;
  icon: string;
}

export interface IComposeTool {
  name: string;
  icon: string;
  setup: (ctx: ToolContext) => IComposeToolInstance;
}

export interface IComposeToolInstance {
  tool: IComposeTool;
  destroy: () => void;
}
