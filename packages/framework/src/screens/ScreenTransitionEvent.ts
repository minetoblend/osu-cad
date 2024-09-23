import type { IScreen } from './IScreen.ts';

export class ScreenTransitionEvent {
  constructor(source: null | IScreen, newScreen: IScreen | null) {}
}
