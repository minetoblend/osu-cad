import type { IScreen } from "./IScreen";
import { ScreenTransitionEvent } from "./ScreenTransitionEvent";

export class ScreenExitEvent extends ScreenTransitionEvent
{
  constructor(
    readonly last: IScreen,
    readonly next: IScreen | null,
    readonly destination: IScreen | null,
  )
  {
    super(last, next);
  }
}
