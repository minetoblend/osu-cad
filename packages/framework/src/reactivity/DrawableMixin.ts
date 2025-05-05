import { extensions } from "pixi.js";
import type { EffectScope } from "./vue";
import { drawableEffectScope } from "./drawableEffectScope";
import { Drawable } from "../graphics";

declare global
{
  namespace OsucadMixins
  {
    interface Drawable
    {
      get effectScope(): import("./vue").EffectScope;
    }
  }
}

interface PrivateDrawable extends Drawable
{
  _effectScope: EffectScope | null,
}

const mixin: Partial<PrivateDrawable> = {

  get effectScope(): EffectScope
  {
    if (this.isDisposed)
      throw new Error("Cannot get EffectScope of disposed drawable");

    this._effectScope ??= drawableEffectScope(this);
    return this._effectScope;
  },
} as PrivateDrawable;

extensions.mixin(Drawable, mixin);
