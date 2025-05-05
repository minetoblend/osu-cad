import type { IFrameBasedClock } from "../timing";
import type { IScreen } from "./IScreen";
import type { ScreenExitEvent } from "./ScreenExitEvent";
import type { ScreenTransitionEvent } from "./ScreenTransitionEvent";
import { resolved } from "../di";
import { Game } from "../Game";
import { Axes, CompositeDrawable } from "../graphics";
import { ScreenStack } from "./ScreenStack";

export abstract class Screen extends CompositeDrawable implements IScreen
{
  readonly isScreen = true;

  validForResume = true;

  validForPush = true;

  override get removeWhenNotAlive()
  {
    return false;
  }

  @resolved(Game)
  game!: Game;

  constructor()
  {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  override updateClock(clock: IFrameBasedClock)
  {
    super.updateClock(clock);

    if (this.parent !== null && !(this.parent instanceof ScreenStack))
    {
      throw new Error(
          `Screens must always be added to a ScreenStack (attempted to add ${this.typeName} to ${this.parent.typeName})`,
      );
    }
  }

  onEntering(e: ScreenTransitionEvent)
  {}

  onExiting(e: ScreenExitEvent): boolean
  {
    return false;
  }

  onResuming(e: ScreenTransitionEvent)
  {}

  onSuspending(e: ScreenTransitionEvent)
  {}

  protected get screenStack()
  {
    const screenStack = this.findClosestParentOfType(ScreenStack);

    if (screenStack === null)
    {
      throw new Error("Cannot exit a screen that is not in a ScreenStack");
    }

    return screenStack;
  }

  exit()
  {
    this.screenStack.exit(this);
  }
}
