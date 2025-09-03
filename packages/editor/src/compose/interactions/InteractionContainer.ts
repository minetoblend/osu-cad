import { ScreenStack } from "@osucad/framework";

export class InteractionContainer extends ScreenStack
{
  public exitAll()
  {
    while(this.currentScreen)
      this.exit(this.currentScreen);
  }
}
