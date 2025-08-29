import type { IScreen } from "./IScreen";

export class ScreenTransitionEvent
{
  public constructor(public readonly source: null | IScreen, public readonly newScreen: IScreen | null)
  {
  }
}
