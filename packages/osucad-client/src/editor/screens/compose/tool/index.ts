import { Component } from "vue";

export interface ComposeScreenTool {
  name: string;
  icon: string;
  component: Component;
  toolbar?: Component;
  state?: () => any;
}

export interface ToolInstance {
  readonly tool: ComposeScreenTool;
  readonly state?: any;
  readonly component: Component;
  readonly toolbar?: Component;
}

export function createTool(tool: ComposeScreenTool) : ToolInstance {
  return {
    tool,
    state: tool.state ? tool.state() : undefined,
    component: tool.component,
    toolbar: tool.toolbar,
  };
}
