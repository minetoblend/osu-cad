import { effectScope } from "./vue";
import type { Drawable } from "../graphics";

export function drawableEffectScope(drawable: Drawable)
{
  const scope = effectScope(true);

  drawable.onDispose(() => scope.stop());

  return scope;
}
