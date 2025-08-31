import type { Drawable } from "../../graphics";
import type { KeyBindingEvent, KeyBindingPressEvent, KeyBindingReleaseEvent } from "../events";
import type { KeyBindingAction } from "../KeyBindingAction";

export const keyBindingHandlersKey = Symbol("keyBindingHandlers");

export type KeyBindingHandlerMethod<Action extends KeyBindingAction, Type extends KeyBindingType, This> =
  Type extends "press"
    ? (this: This, event: KeyBindingPressEvent<Action>) => boolean
    : (this: This, event: KeyBindingReleaseEvent<Action>) => boolean;

export type KeyBindingType = "press" | "release";

export interface KeyBindingHandlerMetadata
{
  action: ActionOrActionType;
  type: KeyBindingType;
  invoke(target: Drawable, event: KeyBindingEvent<KeyBindingAction>): boolean;
}

export type ActionOrActionType<T extends KeyBindingAction = KeyBindingAction> = T | (new (...args: any[]) => T);

export function keyBindingHandler<This extends Drawable, Action extends KeyBindingAction, Type extends KeyBindingType>(
  action: ActionOrActionType<Action> | ActionOrActionType<Action>[],
  type?: Type,
)
{
  return (
    handler: KeyBindingHandlerMethod<Action, Type, This>,
    context: ClassMethodDecoratorContext<This, KeyBindingHandlerMethod<Action, Type, This>>,
  ) =>
  {
    context.addInitializer(function ()
    {
      const handlers = (this as any)[keyBindingHandlersKey] ?? ((this as any)[keyBindingHandlersKey] = []) as KeyBindingHandlerMetadata[];

      const actions = Array.isArray(action) ? action : [action];

      for (const action of actions)
      {
        handlers.push({
          action,
          type: type ?? "press",
          invoke(target: This, event: KeyBindingEvent<Action>)
          {
            return handler.call(target, event as any) ?? false;
          },
        });
      }
    });

  };
}



export function getKeyBindingHandlers(target: Drawable): KeyBindingHandlerMetadata[] | undefined
{
  return (target as any)[keyBindingHandlersKey] as KeyBindingHandlerMetadata[] | undefined;
}
