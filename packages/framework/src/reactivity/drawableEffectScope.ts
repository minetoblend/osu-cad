import { effectScope, type EffectScope } from "./vue";
import type { Drawable } from "../graphics";

export function drawableEffectScope(drawable: Drawable): EffectScope
{
  const scope = effectScope(true);

  drawable.onDispose(() => scope.stop());

  return scope;
}
