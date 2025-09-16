import { Axes, Container } from "@osucad/framework";

export class TestScene extends Container
{
  public constructor()
  {
    super({ relativeSizeAxes: Axes.Both });
  }
}
