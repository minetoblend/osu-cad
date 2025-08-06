import type { Texture } from "pixi.js";
import type { ComposeTool } from "./ComposeTool";

export interface ComposeToolInfo
{
  readonly name: string;
  readonly icon: Texture | null;
  readonly tool: new () => ComposeTool;
}
