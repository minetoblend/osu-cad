import type { Texture } from "pixi.js";
import type { ComposeTool } from "./ComposeTool";
import type { ComposeToolPresenceOverlay } from "./ComposeToolPresenceOverlay";

export interface ComposeToolInfo
{
  readonly id: string;
  readonly name: string;
  readonly icon: Texture | null;
  readonly tool: new () => ComposeTool;
  readonly presenceOverlay?: new () => ComposeToolPresenceOverlay
}
