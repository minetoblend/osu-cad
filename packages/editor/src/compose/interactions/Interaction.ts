import type { Bindable, Drawable, KeyCombinationString, KeyDownEvent, KeyUpEvent, MouseDownEvent, MouseUpEvent, ScreenTransitionEvent } from "@osucad/framework";
import { dependencyLoader, InputKey, Key, KeyCombination, KeyCombinationMatchingMode, MouseButton, resolved, Screen } from "@osucad/framework";
import { EditorHistory } from "../../runtime";
import type { ToolHotkey } from "./ToolHotkey";
import { InteractionContainer } from "./InteractionContainer";
import { deferredPromise, type DeferredPromise } from "@osucad/core";
import type { ModalInteraction } from "./ModalInteraction";
import { DrawableToolHotKey } from "./DrawableToolHotkey";
import { HotkeyBar } from "./HotkeyBar";

export interface ModalInteractionCallback
{
  interaction: Interaction
  promise: DeferredPromise<unknown>
}

export abstract class Interaction extends Screen
{
  public readonly hotkeys: ToolHotkey[] = [];

  public constructor()
  {
    super();

    if (this.completeOnMouseDown)
      this.hotkeys.push(new CompleteOnMouseLeftHotkey(this), new CancelOnMouseRightHotkey(this));
  }

  @resolved(EditorHistory)
  protected accessor history!: EditorHistory

  #pressedKeys = new Set<InputKey>();
  #pressedHotkeys: ToolHotkey[] = [];

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

  readonly #callbacks: ModalInteractionCallback[] = [];

  protected push<T extends Interaction>(interaction: T): Promise<T extends ModalInteraction<infer U> ? U | undefined : void>
  {
    const promise = deferredPromise<unknown>();

    this.#callbacks.push({ interaction, promise });

    this.interactionContainer.push(interaction);

    return promise as Promise<T extends ModalInteraction<infer U> ? U : void>;
  }

  public override onResuming(e: ScreenTransitionEvent)
  {
    for (let i = 0; i < this.#callbacks.length; i++)
    {
      const callback = this.#callbacks[i];

      if (callback.interaction === e.source)
      {
        const result = "result" in e.source ? e.source.result : undefined;

        callback.promise.resolve(result);
        this.#callbacks.splice(i--, 1);
      }
    }

    super.onResuming(e);
  }

  @dependencyLoader()
  #load()
  {
    this.hotkeys.push(...Interaction.getHotkeys(this));
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.addInternal(new HotkeyBar(this).with({ depth: -Number.MAX_VALUE }));
  }

  #onKeyPressed(inputKey: InputKey)
  {
    console.log(InputKey[inputKey], [...this.#pressedKeys].map(key => InputKey[key]));

    if (!this.#pressedKeys.has(inputKey))
    {
      this.#pressedKeys.add(inputKey);

      const combination = KeyCombination.from(...this.#pressedKeys);

      for (const listener of this.hotkeys)
      {
        if (listener.test(inputKey, combination))
        {
          if (listener.onPressed.call(this, inputKey, combination))
          {
            this.#pressedHotkeys.push(listener);
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

      for (let i = 0; i < this.#pressedHotkeys.length; i++)
      {
        const listener = this.#pressedHotkeys[i];

        if (listener.test(inputKey, keyCombination))
        {
          this.#pressedHotkeys.splice(i--, 1);
          listener.onReleased.call(this, inputKey);
        }
      }
    }
  }

  public get completeOnMouseDown()
  {
    return true;
  }

  public get cancelOnRightMouseDown()
  {
    return true;
  }

  protected override onMouseDown(e: MouseDownEvent): boolean
  {
    if (this.#onKeyPressed(KeyCombination.fromMouseButton(e.button)))
      return true;

    return super.onMouseDown(e);
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
  export type InputKeysOrString = InputKey[] | KeyCombinationString | { or: InputKeysOrString[] };

  const hotkeysKey = Symbol("hotkeys");

  const symbolMetadata = Symbol.for("Symbol.metadata");

  export function getHotkeys(target: Interaction): ToolHotkey[]
  {
    return (target as any).constructor[symbolMetadata]?.[hotkeysKey] ?? [];
  }

  function parseKeys(keys: InputKeysOrString): KeyCombination[]
  {
    if (typeof keys === "string")
      return [KeyCombination.parse(keys)];

    if ("or" in keys)
      return keys.or.flatMap(parseKeys);

    return [KeyCombination.from(...keys as InputKey[])];
  }


  export function toggleOnKey(keys: InputKeysOrString, description?: string)
  {
    const keyCombinations = parseKeys(keys);

    return (
      target: unknown,
      context: ClassFieldDecoratorContext<Interaction, Bindable<boolean>>,
    ) =>
    {
      const hotkeys = (context.metadata[hotkeysKey] ?? []) as ToolHotkey[];

      const hotKey = {
        test: (key, combination) => keyCombinations.some(it => it.isPressed(combination, KeyCombinationMatchingMode.Modifiers)),
        onPressed()
        {
          const bindable = context.access.get(this);
          bindable.value = !bindable.value;
          return true;
        },
        onReleased()
        {
          const bindable = context.access.get(this);
          bindable.value = !bindable.value;
        },
        createDrawable: () =>
        {
          if (description)
            return new DrawableToolHotKey(keyCombinations, description);

          return undefined;
        },
      } as ToolHotkey;

      context.metadata[hotkeysKey] = [ ...hotkeys, hotKey ];
    };
  }

  export function toggleOnKeyDown(keys: InputKeysOrString, description?: string)
  {
    const keyCombinations = parseKeys(keys);

    return (
      target: unknown,
      context: ClassFieldDecoratorContext<Interaction, Bindable<boolean>>,
    ) =>
    {
      const hotkeys = (context.metadata[hotkeysKey] ?? []) as ToolHotkey[];

      const hotKey = {
        test: (key, combination) => keyCombinations.some(it => it.isPressed(combination, KeyCombinationMatchingMode.Modifiers)),
        onPressed()
        {
          const bindable = context.access.get(this);
          bindable.value = !bindable.value;
          return true;
        },
        onReleased()
        {
        },
        createDrawable: () =>
        {
          if (description)
            return new DrawableToolHotKey(keyCombinations, description);

          return undefined;
        },
      } as ToolHotkey;

      context.metadata[hotkeysKey] = [ ...hotkeys, hotKey ];
    };
  }

  export function invokeOnKey(keys: InputKeysOrString, description?: string)
  {
    const keyCombinations = parseKeys(keys);

    return (
      target: (this: Interaction, key: InputKey) => boolean | void,
      context: ClassMethodDecoratorContext<Interaction, (key: InputKey) => boolean | void>,
    ) =>
    {
      const hotkeys = (context.metadata[hotkeysKey] ?? []) as ToolHotkey[];

      const hotKey = {
        test: (key, combination) => keyCombinations.some(it => it.isPressed(combination, KeyCombinationMatchingMode.Modifiers)),
        onPressed(key)
        {
          target.call(this, key);
          return true;
        },
        onReleased()
        {
        },
        createDrawable: () =>
        {
          if (description)
            return new DrawableToolHotKey(keyCombinations, description);

          return undefined;
        },
      } as ToolHotkey;

      context.metadata[hotkeysKey] = [ ...hotkeys, hotKey ];
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

        this.hotkeys.push({
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

class CompleteOnMouseLeftHotkey implements ToolHotkey
{
  public constructor(public readonly interaction: Interaction)
  {
  }

  public test(key: InputKey, keyCombination: KeyCombination): boolean
  {
    return this.interaction.completeOnMouseDown && key === InputKey.MouseLeftButton;
  }

  public onPressed = (key: InputKey, keyCombination: KeyCombination) =>
  {
    this.interaction.complete();
    return true;
  };

  public onReleased = (key: InputKey) =>
  {
  };

  public createDrawable?(): Drawable | undefined
  {
    if (this.interaction.completeOnMouseDown)
      return new DrawableToolHotKey([KeyCombination.from(KeyCombination.fromMouseButton(MouseButton.Left))], "Confirm");

    return undefined;
  }
}


class CancelOnMouseRightHotkey implements ToolHotkey
{
  public constructor(public readonly interaction: Interaction)
  {
  }

  public test(key: InputKey, keyCombination: KeyCombination): boolean
  {
    return this.interaction.cancelOnRightMouseDown && key === InputKey.MouseRightButton;
  }

  public onPressed = (key: InputKey, keyCombination: KeyCombination) =>
  {
    this.interaction.cancel();
    return true;
  };

  public onReleased = (key: InputKey) =>
  {
  };

  public createDrawable?(): Drawable | undefined
  {
    if (this.interaction.cancelOnRightMouseDown)
      return new DrawableToolHotKey([KeyCombination.from(KeyCombination.fromMouseButton(MouseButton.Right))], "Cancel");

    return undefined;
  }
}
