import { KeyBindingAction } from 'osucad-framework';

export class OsuAction extends KeyBindingAction {
  constructor(readonly name: string) {
    super();
  }

  static readonly LeftButton = new OsuAction('LeftButton');
  static readonly RightButton = new OsuAction('RightButton');
  static readonly Smoke = new OsuAction('Smoke');
}
