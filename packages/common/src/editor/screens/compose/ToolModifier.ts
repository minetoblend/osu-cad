import type { InputKey } from 'osucad-framework';
import { Action, BindableBoolean } from 'osucad-framework';

export enum ModifierType {
  Temporary,
  Toggle,
  Action,
}

export class ToolModifier {
  constructor(
    readonly inputKey: InputKey,
    readonly hint: string,
    readonly modifierType: ModifierType,
  ) {
  }

  readonly isActive = new BindableBoolean();

  readonly activated = new Action();

  readonly disabled = new BindableBoolean();

  unbindAll() {
    this.isActive.unbindAll();
    this.disabled.unbindAll();
    this.activated.removeAllListeners();
  }
}
