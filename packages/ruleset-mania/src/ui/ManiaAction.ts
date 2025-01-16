import type { Bindable } from '@osucad/framework';
import { injectionToken, KeyBindingAction } from '@osucad/framework';

export class ManiaAction extends KeyBindingAction {
  private constructor(readonly key: number) {
    super();
  }

  static readonly Key1 = new ManiaAction(1);
  static readonly Key2 = new ManiaAction(2);
  static readonly Key3 = new ManiaAction(3);
  static readonly Key4 = new ManiaAction(4);
  static readonly Key5 = new ManiaAction(5);
  static readonly Key6 = new ManiaAction(6);
  static readonly Key7 = new ManiaAction(7);
  static readonly Key8 = new ManiaAction(8);
  static readonly Key9 = new ManiaAction(9);
  static readonly Key10 = new ManiaAction(10);
  static readonly Key11 = new ManiaAction(11);
  static readonly Key12 = new ManiaAction(12);
  static readonly Key13 = new ManiaAction(13);
  static readonly Key14 = new ManiaAction(14);
  static readonly Key15 = new ManiaAction(15);
  static readonly Key16 = new ManiaAction(16);
  static readonly Key17 = new ManiaAction(17);
  static readonly Key18 = new ManiaAction(18);
  static readonly Key19 = new ManiaAction(19);
  static readonly Key20 = new ManiaAction(20);

  static #keyActions = [
    ManiaAction.Key1,
    ManiaAction.Key2,
    ManiaAction.Key3,
    ManiaAction.Key4,
    ManiaAction.Key5,
    ManiaAction.Key6,
    ManiaAction.Key7,
    ManiaAction.Key8,
    ManiaAction.Key9,
    ManiaAction.Key10,
    ManiaAction.Key11,
    ManiaAction.Key12,
    ManiaAction.Key13,
    ManiaAction.Key14,
    ManiaAction.Key15,
    ManiaAction.Key16,
    ManiaAction.Key17,
    ManiaAction.Key18,
    ManiaAction.Key19,
    ManiaAction.Key20,
  ];

  static getFromKey(key: number): ManiaAction {
    return ManiaAction.#keyActions[key - 1];
  }
}

export const BindableManiaAction = injectionToken<Bindable<ManiaAction>>();
