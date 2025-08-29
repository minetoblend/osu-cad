import type { IScreen } from "./IScreen";
import { ScreenTransitionEvent } from "./ScreenTransitionEvent";

export class ScreenExitEvent extends ScreenTransitionEvent
{
  public constructor(
    public readonly last: IScreen,
    public readonly next: IScreen | null,
    public readonly destination: IScreen | null,
  )
  {
    super(last, next);
  }
}
