import type { ScreenExitEvent } from "./ScreenExitEvent";
import type { ScreenTransitionEvent } from "./ScreenTransitionEvent";
import type { IDrawable } from "../graphics/drawables/IDrawable";
import type { Drawable } from "../graphics/drawables/Drawable";

export interface IScreen extends IDrawable
{
  readonly isScreen: true;

  validForResume: boolean;

  validForPush: boolean;

  onEntering: (e: ScreenTransitionEvent) => void;

  onExiting: (e: ScreenExitEvent) => boolean;

  onResuming: (e: ScreenTransitionEvent) => void;

  onSuspending: (e: ScreenTransitionEvent) => void;

  asDrawable(): Drawable
}

export function isScreen(obj: any): obj is IScreen
{
  return obj.isScreen === true;
}
