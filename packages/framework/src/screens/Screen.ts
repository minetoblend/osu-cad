import type { IFrameBasedClock } from "../timing";
import type { IScreen } from "./IScreen";
import type { ScreenExitEvent } from "./ScreenExitEvent";
import type { ScreenTransitionEvent } from "./ScreenTransitionEvent";
import { Axes, CompositeDrawable } from "../graphics";
import { ScreenStack } from "./ScreenStack";

export abstract class Screen extends CompositeDrawable implements IScreen
{
  public readonly isScreen = true;

  public validForResume = true;

  public validForPush = true;

  public override get removeWhenNotAlive()
  {
    return false;
  }

  public constructor()
  {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  public override updateClock(clock: IFrameBasedClock)
  {
    super.updateClock(clock);

    if (this.parent !== null && !(this.parent instanceof ScreenStack))
    {
      throw new Error(
          `Screens must always be added to a ScreenStack (attempted to add ${this.typeName} to ${this.parent.typeName})`,
      );
    }
  }

  public onEntering(e: ScreenTransitionEvent)
  {}

  public onExiting(e: ScreenExitEvent): boolean
  {
    return false;
  }

  public onResuming(e: ScreenTransitionEvent)
  {}

  public onSuspending(e: ScreenTransitionEvent)
  {}

  protected get screenStack()
  {
    return this.findClosestParentOfType(ScreenStack);
  }

  public exit()
  {
    const screenStack = this.screenStack;

    if (screenStack === null)
    {
      throw new Error("Cannot exit a screen that is not in a ScreenStack");
    }

    screenStack.exit(this);
  }
}
