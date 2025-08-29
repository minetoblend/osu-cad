import type { Transformable } from "./Transformable";
import { Usable } from "../../types/IUsable";
import { almostEquals } from "../../utils";

export class AbsoluteSequenceSender extends Usable
{
  public constructor(
    public readonly sender: Transformable,
    public readonly oldTransformDelay: number,
    public readonly newTransformDelay: number,
  )
  {
    super();
  }

  public dispose(): void
  {
    if (!almostEquals(this.newTransformDelay, this.sender.transformDelay))
    {
      throw new Error(
          "transformStartTime at the end of absolute sequence is not the same as at the beginning, but should be. "
        + `(begin=${this.newTransformDelay} end=${this.sender.transformDelay})`,
      );
    }

    this.sender.transformDelay = this.oldTransformDelay;
  }
}
