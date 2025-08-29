import { KeyBindingAction } from "@osucad/framework";

export class OsuAction extends KeyBindingAction
{
  public constructor(public readonly name: string)
  {
    super();
  }

  public static readonly LeftButton = new OsuAction("Key1");

  public static readonly RightButton = new OsuAction("Key2");

  public static readonly Smoke = new OsuAction("Smoke");
}
