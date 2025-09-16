import "@osucad/visual-tests";
import { Game, WebGameHost } from "@osucad/framework";
import { createTestBrowser } from "virtual:test-browser";

class OsucadTestGame extends Game
{
  public constructor()
  {
    super();
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.add(createTestBrowser());
  }
}

new WebGameHost().run(new OsucadTestGame());
