import debug from "debug";
import type { Drawable } from "../graphics/drawables/Drawable";
import type { List } from "../utils/List";
import type { UIEvent } from "./events/UIEvent";
import type { InputManager } from "./InputManager";
import type { InputState } from "./state/InputState";
import { ButtonStateChangeKind } from "./stateChanges/events/ButtonStateChangeKind";

const log = debug("ButtonEventManager");

export abstract class ButtonEventManager<TButton>
{
  public handleButtonStateChange(state: InputState, kind: ButtonStateChangeKind, event?: globalThis.UIEvent)
  {
    if (kind === ButtonStateChangeKind.Pressed)
      this.#handleButtonDown(state, event);
    else
      this.#handleButtonUp(state);
  }

  public constructor(public button: TButton)
  {
  }

  public inputManager!: InputManager;
  public getInputQueue!: () => List<Drawable>;

  public buttonDownInputQueue: Drawable[] | null = null;

  #handleButtonDown(state: InputState, event?: globalThis.UIEvent): boolean
  {
    const inputQueue = this.getInputQueue();
    const handledBy = this.handleButtonDown(state, inputQueue);

    if (handledBy !== null)
    {
      // only drawables up to the one that handled mouse down should handle mouse up, so remove all subsequent drawables from the queue (for future use).
      const count = inputQueue.indexOf(handledBy) + 1;
      inputQueue.splice(count, inputQueue.length - count);

      event?.preventDefault();
    }

    this.buttonDownInputQueue = [...inputQueue];

    return handledBy !== null;
  }

  protected abstract handleButtonDown(state: InputState, targets: List<Drawable>): Drawable | null;

  #handleButtonUp(state: InputState)
  {
    if (this.buttonDownInputQueue === null)
      return;

    this.handleButtonUp(
        state,
        this.buttonDownInputQueue.filter(d => d.isRootedAt(this.inputManager)),
    );
    this.buttonDownInputQueue = null;
  }

  protected abstract handleButtonUp(state: InputState, targets: Drawable[]): void;

  protected propagateButtonEvent(drawables: Iterable<Drawable>, e: UIEvent): Drawable | null
  {
    let handledBy: Drawable | null = null;

    for (const target of drawables)
    {
      if (target.triggerEvent(e))
      {
        handledBy = target;
        break;
      }
    }

    if (log.enabled)
      log(`Event ${e.toString()} handled by ${handledBy?.label ?? handledBy?.constructor.name ?? null}`);

    return handledBy;
  }
}
