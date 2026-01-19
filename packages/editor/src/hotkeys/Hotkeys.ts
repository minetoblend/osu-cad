import type { HotkeyHandler, HotKeyHandlerOptions } from "./HotkeyHandler";
import { defineHotkeyHandler } from "./HotkeyHandler";
import type { HotkeyEvent } from "./HotkeyEvent";
import { HotkeyKeyBindingEvent } from "./HotkeyEvent";
import { HotkeyKeyEvent } from "./HotkeyEvent";
import type { ActionOrActionType, Bindable, Drawable, KeyBindingAction, KeyCombinationString } from "@osucad/framework";
import { InputKey } from "@osucad/framework";
import { KeyCombination, KeyCombinationMatchingMode } from "@osucad/framework";
import { DrawableKeyCombinationHotKey } from "./DrawableKeyCombinationHotKey";
import { DrawableKeyBindingHotkey } from "./DrawableKeyBindingHotkey";

export namespace Hotkeys
{
  const symbolMetadata = Symbol.for("Symbol.metadata");
  const handlerKey = Symbol("hotkeys");

  export function getHotkeys(target: Drawable): HotkeyHandler[]
  {
    return (target as any).constructor[symbolMetadata]?.[handlerKey] ?? [];
  }

  export type KeyDownHandler<Evt extends HotkeyEvent = HotkeyEvent> = (evt: Evt) => void | boolean;

  function addHandler(
    context:
          | ClassAccessorDecoratorContext<Drawable>
          | ClassMethodDecoratorContext<Drawable>
          | ClassFieldDecoratorContext<Drawable>
          | ClassGetterDecoratorContext<Drawable>
          | ClassSetterDecoratorContext<Drawable>,
    handler: HotKeyHandlerOptions,
  )
  {
    context.metadata[handlerKey] = [
      ...(context.metadata[handlerKey] ?? []) as HotkeyHandler[],
      defineHotkeyHandler(handler),
    ];
  }

  export interface HotkeyOptions
  {
    label?: string
    priority?: number
  }

  export function key(
    keys: KeyCombinationString | InputKey[],
    { label, priority }: HotkeyOptions = {},
  )
  {
    const keyCombination = typeof keys === "string" ? KeyCombination.parse(keys) : KeyCombination.from(...keys);

    return (
      target: KeyDownHandler<HotkeyKeyEvent>,
      context: ClassMethodDecoratorContext<Drawable, KeyDownHandler<HotkeyKeyEvent>>,
    ) =>
    {
      addHandler(context, {
        priority,
        test: event =>
          event instanceof HotkeyKeyEvent
            && keyCombination.isPressed(event.keyCombination, KeyCombinationMatchingMode.Modifiers),
        onPress: (event: HotkeyEvent) => target.call(event.target, event as HotkeyKeyEvent) ?? true,
        createDrawable: label
            ? () => new DrawableKeyCombinationHotKey(keyCombination, label)
            : undefined,
      });
    };
  }

  export function keyBinding<Action extends KeyBindingAction>(
    action: ActionOrActionType<Action>,
    { label, priority }: HotkeyOptions = {},
  )
  {
    return (
      target: KeyDownHandler<HotkeyKeyBindingEvent<Action>>,
      context: ClassMethodDecoratorContext<Drawable, KeyDownHandler<HotkeyKeyBindingEvent<Action>>>,
    ) =>
    {
      addHandler(context, {
        priority,
        test: (event: HotkeyEvent) =>
          event instanceof HotkeyKeyBindingEvent
            && event.action.equals(action),
        onPress: (event: HotkeyEvent) => target.call(event.target, event as HotkeyKeyBindingEvent<Action>) ?? true,
        createDrawable: label
            ? () => new DrawableKeyBindingHotkey(action, label)
            : undefined,
      });
    };
  }

  export namespace toggle
  {
    export function key(
      keys: KeyCombinationString | InputKey[],
      { label, priority }: HotkeyOptions = {},
    )
    {
      const keyCombination = typeof keys === "string" ? KeyCombination.parse(keys) : KeyCombination.from(...keys);

      return (
        target: unknown,
        context:
              | ClassFieldDecoratorContext<Drawable, Bindable<boolean>>
              | ClassAccessorDecoratorContext<Drawable, Bindable<boolean>>,
      ) =>
      {
        addHandler(context, {
          priority,
          test: event =>
            event instanceof HotkeyKeyEvent
              && keyCombination.isPressed(event.keyCombination, KeyCombinationMatchingMode.Modifiers),
          onPress(event: HotkeyEvent)
          {
            const bindable = context.access.get(this);
            bindable.value = !bindable.value;
            return true;
          },
          onRelease(event: HotkeyEvent)
          {
            const bindable = context.access.get(this);
            bindable.value = !bindable.value;
            return true;
          },
          createDrawable: label
              ? () => new DrawableKeyCombinationHotKey(keyCombination, label)
              : undefined,
        });
      };
    }

    export function keyDown(
      keys: KeyCombinationString | InputKey[],
      { label, priority }: HotkeyOptions = {},
    )
    {
      const keyCombination = typeof keys === "string" ? KeyCombination.parse(keys) : KeyCombination.from(...keys);

      return (
        target: unknown,
        context:
              | ClassFieldDecoratorContext<Drawable, Bindable<boolean>>
              | ClassAccessorDecoratorContext<Drawable, Bindable<boolean>>,
      ) =>
      {
        addHandler(context, {
          priority,
          test: event =>
            event instanceof HotkeyKeyEvent
              && keyCombination.isPressed(event.keyCombination, KeyCombinationMatchingMode.Modifiers),
          onPress(event: HotkeyEvent)
          {
            const bindable = context.access.get(this);
            bindable.value = !bindable.value;
            return true;
          },
          createDrawable: label
              ? () => new DrawableKeyCombinationHotKey(keyCombination, label)
              : undefined,
        });
      };
    }
  }

  export interface InputNumberOptions
  {
    allowNegative?: boolean
  }

  export function inputNumberString(options: InputNumberOptions = {})
  {
    const {
      allowNegative = false,
    } = options;

    return (
      target: unknown,
      context: ClassFieldDecoratorContext<Drawable, Bindable<string>>,
    ) =>
    {
      function getDigit(key: InputKey)
      {
        if (InputKey[key].startsWith("Number") && InputKey[key].length === "Number".length + 1)
          return InputKey[key].slice("Number".length);

        return undefined;
      }

      addHandler(context, {
        test: event =>
        {
          if (!(event instanceof HotkeyKeyEvent))
            return false;

          const key = event.key;

          if (key === InputKey.Period)
            return true;

          if (key === InputKey.Minus && allowNegative)
            return true;

          if (key === InputKey.BackSpace)
            return true;

          if (getDigit(key) !== undefined)
            return true;

          return false;
        },
        onPress(event: HotkeyEvent): boolean
        {
          const bindable = context.access.get(this);

          const key = (event as HotkeyKeyEvent).key;

          if (key === InputKey.Period)
          {
            if (!bindable.value.includes("."))
              bindable.value += ".";
            return true;
          }

          if (key === InputKey.Minus && allowNegative)
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
      });
    };
  }
}
