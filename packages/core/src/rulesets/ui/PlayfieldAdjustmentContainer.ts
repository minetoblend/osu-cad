import { Axes, Container } from "@osucad/framework";

export class PlayfieldAdjustmentContainer extends Container
{
  constructor()
  {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }
}
