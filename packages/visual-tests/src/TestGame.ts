import { Game } from "@osucad/framework";
import { TestBrowser } from "./TestBrowser";

export class TestGame extends Game
{
  public constructor()
  {
    super();
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.add(new TestBrowser());
  }
}
