import type { Bindable, InputKey, KeyCombinationString, KeyDownEvent, KeyUpEvent, MouseDownEvent, MouseUpEvent } from "@osucad/framework";
import { KeyCombinationMatchingMode } from "@osucad/framework";
import { Axes, CompositeDrawable, Key, KeyCombination, MouseButton, resolved } from "@osucad/framework";
import { EditorHistory } from "../../runtime";
import type { KeyReceiver } from "./KeyReceiver";

export abstract class Interaction extends CompositeDrawable
{
  public readonly inputListeners: KeyReceiver[] = [];

  public constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(EditorHistory)
  protected accessor history!: EditorHistory

  #pressedKeys = new Set<InputKey>();
  #pressedListeners = new Set<KeyReceiver>();

  protected override onKeyDown(e: KeyDownEvent): boolean
  {
    if (this.#onKeyPressed(KeyCombination.fromKey(e.key)))
      return true;

    switch (e.key)
    {
    case Key.Enter:
      this.complete();
      return true;
    case Key.Escape:
      this.cancel();
      return true;
    default:
      return false;
    }
  }

  #onKeyPressed(inputKey: InputKey)
  {
    if (!this.#pressedKeys.has(inputKey))
    {
      this.#pressedKeys.add(inputKey);

      const combination = KeyCombination.from(...this.#pressedKeys);

      for (const listener of this.inputListeners)
      {
        if (listener.keyCombination.isPressed(combination, KeyCombinationMatchingMode.Modifiers))
        {
          if (!this.#pressedListeners.has(listener) && listener.onPressed())
          {
            this.#pressedListeners.add(listener);
            return true;
          }
        }
      }
    }

    return false;
  }

  protected override onKeyUp(e: KeyUpEvent)
  {
    this.#onKeyReleased(KeyCombination.fromKey(e.key));
  }

  #onKeyReleased(inputKey: InputKey)
  {
    if (this.#pressedKeys.delete(inputKey))
    {
      const keyCombination = KeyCombination.from(...this.#pressedKeys, inputKey);

      for (const listener of this.#pressedListeners)
      {
        if (listener.keyCombination.isPressed(keyCombination, KeyCombinationMatchingMode.Modifiers))
        {
          this.#pressedListeners.delete(listener);
          listener.onReleased();
        }
      }
    }
  }

  protected get completeOnMouseDown()
  {
    return true;
  }
  protected get cancelOnRightMouseDown()
  {
    return true;
  }

  protected override onMouseDown(e: MouseDownEvent): boolean
  {
    if (this.#onKeyPressed(KeyCombination.fromMouseButton(e.button)))
      return true;

    switch (e.button)
    {
    case MouseButton.Left:
      if (this.completeOnMouseDown)
      {
        this.complete();
        return true;
      }
      break;
    case MouseButton.Right:
      if (this.cancelOnRightMouseDown)
      {
        this.cancel();
        return true;
      }
      break;
    }

    return false;
  }

  protected override onMouseUp(e: MouseUpEvent)
  {
    this.#onKeyReleased(KeyCombination.fromMouseButton(e.button));

    super.onMouseUp(e);
  }

  #completed = false;

  public complete()
  {
    if (this.#completed)
      return;

    this.#completed = true;
    this.onComplete();

    this.expire();
  }

  protected onComplete()
  {
    this.history.commit();
  }

  public cancel()
  {
    if (this.#completed)
      return;

    this.#completed = true;
    this.onCancel();

    this.expire();
  }

  protected onCancel()
  {
    this.history.discardUncommittedChanges();
  }
}

export namespace Interaction
{
  export type InputKeysOrString = InputKey[] | [KeyCombinationString];

  function parseKeys(keys: InputKeysOrString)
  {
    if (typeof keys[0] === "string")
      return KeyCombination.parse(keys[0]);

    return KeyCombination.from(...keys as InputKey[]);
  }


  export function toggleOnKey(...keys: InputKeysOrString)
  {
    return (
      target: unknown,
      context: ClassFieldDecoratorContext<Interaction, Bindable<boolean>>,
    ) =>
    {
      context.addInitializer(function()
      {
        const bindable = context.access.get(this);

        this.inputListeners.push({
          keyCombination: parseKeys(keys),
          onPressed: () =>
          {
            bindable.value = !bindable.value;
            return true;
          },
          onReleased: () => bindable.value = !bindable.value,
        });
      });
    };
  }

  export function toggleOnKeyDown(...keys: InputKeysOrString)
  {
    return (
      target: unknown,
      context: ClassFieldDecoratorContext<Interaction, Bindable<boolean>>,
    ) =>
    {
      context.addInitializer(function()
      {
        const bindable = context.access.get(this);

        this.inputListeners.push({
          keyCombination: parseKeys(keys),
          onPressed: () =>
          {
            bindable.value = !bindable.value;
            return true;
          },
          onReleased: () =>
          {
          },
        });
      });
    };
  }

  export function invokeOnKey(...keys: InputKeysOrString)
  {
    return (
      target: (this: Interaction) => boolean | void,
      context: ClassMethodDecoratorContext<Interaction, () => boolean | void>,
    ) =>
    {
      context.addInitializer(function()
      {
        this.inputListeners.push({
          keyCombination: parseKeys(keys),
          onPressed: () =>
          {
            target.call(this);
            return true;
          },
          onReleased: () =>
          {
          },
        });
      });
    };
  }
}
