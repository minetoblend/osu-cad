import type { ComposeToolPresenceOverlay } from "./ComposeToolPresenceOverlay";

export interface ComposeToolInfo
{
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly presenceOverlay?: new () => ComposeToolPresenceOverlay
}
