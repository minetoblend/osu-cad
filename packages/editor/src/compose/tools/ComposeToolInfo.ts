import type { ComposeTool } from "./ComposeTool";
import type { ComposeToolPresenceOverlay } from "./ComposeToolPresenceOverlay";

export interface ComposeToolInfo
{
  new (): ComposeTool;

  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly presenceOverlay?: new () => ComposeToolPresenceOverlay
}
