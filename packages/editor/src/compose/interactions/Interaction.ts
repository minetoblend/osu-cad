import type { Bindable, KeyCombinationString, KeyDownEvent, KeyUpEvent, MouseDownEvent, MouseUpEvent } from "@osucad/framework";
import { InputKey, Key, KeyCombination, KeyCombinationMatchingMode, MouseButton, resolved, Screen } from "@osucad/framework";
import { EditorHistory } from "../../runtime";
import type { KeyReceiver } from "./KeyReceiver";
import { InteractionContainer } from "./InteractionContainer";

export abstract class Interaction extends Screen
{
  public readonly inputListeners: KeyReceiver[] = [];

  public constructor()
  {
    super();
  }

  @resolved(EditorHistory)
  protected accessor history!: EditorHistory

  #pressedKeys = new Set<InputKey>();
  #pressedListeners: KeyReceiver[] = [];

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

  protected get interactionContainer(): InteractionContainer
  {
    const screenStack = this.screenStack;

    if (!(screenStack instanceof InteractionContainer))
      throw new Error("Cannot push an interaction when not child of an InteractionContainer");

    return screenStack;
  }

  protected push(interaction: Interaction)
  {
    this.interactionContainer.push(interaction);
  }

  #onKeyPressed(inputKey: InputKey)
  {
    if (!this.#pressedKeys.has(inputKey))
    {
      this.#pressedKeys.add(inputKey);

      const combination = KeyCombination.from(...this.#pressedKeys);

      for (const listener of this.inputListeners)
      {
        if (listener.test(inputKey, combination))
        {
          if (listener.onPressed(inputKey, combination))
          {
            this.#pressedListeners.push(listener);
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

      for (let i = 0; i < this.#pressedListeners.length; i++)
      {
        const listener = this.#pressedListeners[i];

        if (listener.test(inputKey, keyCombination))
        {
          this.#pressedListeners.splice(i--, 1);
          listener.onReleased(inputKey);
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

  public get completed()
  {
    return this.#completed;
  }

  public complete()
  {
    if (this.#completed)
      return;

    this.#completed = true;
    this.onComplete();

    this.exit();
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

    this.exit();
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

        const keyCombination = parseKeys(keys);

        this.inputListeners.push({
          test: (key, combination) => keyCombination.isPressed(combination, KeyCombinationMatchingMode.Modifiers),
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

        const keyCombination = parseKeys(keys);

        this.inputListeners.push({
          test: (key, combination) => keyCombination.isPressed(combination, KeyCombinationMatchingMode.Modifiers),
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
        const keyCombination = parseKeys(keys);

        this.inputListeners.push({
          test: (key, combination) => keyCombination.isPressed(combination, KeyCombinationMatchingMode.Modifiers),
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

  export function inputNumberString()
  {
    return (
      target: unknown,
      context: ClassFieldDecoratorContext<Interaction, Bindable<string>>,
    ) =>
    {
      context.addInitializer(function()
      {
        const bindable = context.access.get(this);

        function getDigit(key: InputKey)
        {
          if (InputKey[key].startsWith("Number") && InputKey[key].length === "Number".length + 1)
            return InputKey[key].slice("Number".length);

          return undefined;
        }

        this.inputListeners.push({
          test: key =>
          {
            if (key === InputKey.Period)
              return true;

            if (key === InputKey.Minus)
              return true;

            if (key === InputKey.BackSpace)
              return true;

            if (getDigit(key) !== undefined)
              return true;

            return false;
          },
          onPressed: (key) =>
          {
            if (key === InputKey.Period)
            {
              if (!bindable.value.includes("."))
                bindable.value += ".";
              return true;
            }

            if (key === InputKey.Minus)
            {
              if (bindable.value.startsWith("-"))
                bindable.value = bindable.value.slice(1);
              else
                bindable.value = `-${bindable.value}`;
              return true;
            }

            const digit = getDigit(key);
            if (digit !== undefined)
            {
              bindable.value = Number.parseFloat(bindable.value + digit).toString();
              return true;
            }

            if (key === InputKey.BackSpace)
            {
              bindable.value = bindable.value.slice(0, -1);
              return true;
            }

            return false;
          },
          onReleased: () =>
          {
          },
        });
      });
    };
  }
}
