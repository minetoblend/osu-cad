import type { IScreen } from './IScreen.ts';
import { ScreenTransitionEvent } from './ScreenTransitionEvent.ts';

export class ScreenExitEvent extends ScreenTransitionEvent {
  constructor(
    last: IScreen,
    next: IScreen | null,
    readonly destination: IScreen | null,
  ) {
    super(last, next);
  }
}
