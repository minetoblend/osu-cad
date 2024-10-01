import type { IScreen } from './IScreen';

export class ScreenTransitionEvent {
  constructor(readonly source: null | IScreen, readonly newScreen: IScreen | null) {}
}
