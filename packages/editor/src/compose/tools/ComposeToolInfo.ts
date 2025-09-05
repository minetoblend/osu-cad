import type { ComposeTool } from "./ComposeTool";
import type { ComposeToolPresenceOverlay } from "./ComposeToolPresenceOverlay";

export interface ComposeToolInfo
{
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly tool: new () => ComposeTool;
  readonly presenceOverlay?: new () => ComposeToolPresenceOverlay
}
