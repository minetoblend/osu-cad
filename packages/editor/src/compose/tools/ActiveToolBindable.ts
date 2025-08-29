import { Bindable } from "@osucad/framework";
import type { ComposeToolInfo } from "./ComposeToolInfo";

export class ActiveToolBindable extends Bindable<ComposeToolInfo>
{
  public override createInstance()
  {
    return new ActiveToolBindable(this.value);
  }
}
