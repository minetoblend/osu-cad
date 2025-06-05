import { CursorContainer, Visibility } from "@osucad/framework";

export class GameplayCursorContainer extends CursorContainer
{
  public lastFrameState: Visibility = Visibility.Hidden;

  override update()
  {
    super.update();

    this.lastFrameState = this.state.value;
  }
}
