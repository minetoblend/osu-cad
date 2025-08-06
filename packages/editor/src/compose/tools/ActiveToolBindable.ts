import { Bindable } from "@osucad/framework";
import type { ComposeToolInfo } from "./ComposeToolInfo";

export class ActiveToolBindable extends Bindable<ComposeToolInfo>
{
  override createInstance()
  {
    return new ActiveToolBindable(this.value);
  }
}
