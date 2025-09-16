import { Bindable } from "@osucad/framework";
import type { ComposeToolClass } from "./ComposeTool";

export class ActiveToolBindable extends Bindable<ComposeToolClass>
{
  public override createInstance()
  {
    return new ActiveToolBindable(this.value);
  }
}
