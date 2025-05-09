import { KeyBindingAction } from "@osucad/framework";

export class OsuAction extends KeyBindingAction
{
  constructor(readonly name: string)
  {
    super();
  }

  static readonly LeftButton = new OsuAction("Key1");

  static readonly RightButton = new OsuAction("Key2");

  static readonly Smoke = new OsuAction("Smoke");
}
